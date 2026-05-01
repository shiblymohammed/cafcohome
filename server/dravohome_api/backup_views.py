"""
Database Backup & Restore Views
Exports/imports all data as JSON using Django's serialization framework.
Supports conflict resolution: overwrite, rename, skip.
"""

import json
import io
import re
from datetime import datetime

from django.core import serializers
from django.db import transaction, connection
from django.apps import apps
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status

from accounts.authentication import StaffTokenAuthentication
from rest_framework.permissions import IsAuthenticated


# ── Models to include in backup (ordered to respect FK dependencies) ──────────
BACKUP_MODELS = [
    # Auth / Accounts
    'accounts.User',
    'accounts.Staff',
    # Products
    'products.Color',
    'products.Material',
    'products.Category',
    'products.Subcategory',
    'products.Brand',
    'products.Product',
    'products.ProductVariant',
    'products.ShopByRoom',
    # Inventory
    'inventory.StockMovement',
    'inventory.StockAlert',
    # Offers
    'offers.Offer',
    # Orders
    'orders.Order',
    'orders.OrderItem',
    'orders.OrderTracking',
    'orders.QuotationLog',
    # Blog
    'blog.BlogPost',
    # Reviews
    'reviews.Review',
]

# Models that have a MaterialColor through table
MATERIAL_COLOR_MODELS = [
    'products.MaterialColor',
]


def get_model_safe(app_label, model_name):
    """Return model class or None if not found."""
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None


def get_all_backup_models():
    """Return list of (app_label, model_name, Model) tuples."""
    result = []
    all_models = BACKUP_MODELS + MATERIAL_COLOR_MODELS
    for dotted in all_models:
        app_label, model_name = dotted.rsplit('.', 1)
        model = get_model_safe(app_label, model_name)
        if model is not None:
            result.append((app_label, model_name, model))
    return result


class BackupView(APIView):
    """
    GET /api/v1/backup/
    Returns a full JSON backup of all database tables.
    Admin only.
    """
    authentication_classes = [StaffTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user and getattr(request.user, 'role', None) == 'admin'):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        backup_data = {
            'version': '1.0',
            'created_at': datetime.utcnow().isoformat() + 'Z',
            'database': connection.settings_dict.get('NAME', 'unknown'),
            'tables': {},
            'meta': {},
        }

        models = get_all_backup_models()

        for app_label, model_name, Model in models:
            key = f'{app_label}.{model_name}'
            try:
                qs = Model.objects.all()
                serialized = serializers.serialize('python', qs)
                backup_data['tables'][key] = serialized
                backup_data['meta'][key] = {
                    'count': len(serialized),
                    'app': app_label,
                    'model': model_name,
                }
            except Exception as e:
                backup_data['meta'][key] = {'error': str(e), 'count': 0}
                backup_data['tables'][key] = []

        # Build filename
        ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f'dravohome_backup_{ts}.json'

        response = HttpResponse(
            json.dumps(backup_data, indent=2, default=str),
            content_type='application/json',
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class BackupPreviewView(APIView):
    """
    POST /api/v1/backup/preview/
    Accepts a backup JSON file and returns a conflict analysis:
    for each record, whether it already exists in the DB.
    Admin only.
    """
    authentication_classes = [StaffTokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if not (request.user and getattr(request.user, 'role', None) == 'admin'):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        file_obj = request.FILES.get('backup_file')
        if not file_obj:
            return Response({'error': 'No backup file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            raw = file_obj.read().decode('utf-8')
            backup_data = json.loads(raw)
        except Exception as e:
            return Response({'error': f'Invalid backup file: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        if 'tables' not in backup_data:
            return Response({'error': 'Invalid backup format: missing "tables" key'}, status=status.HTTP_400_BAD_REQUEST)

        preview = {
            'version': backup_data.get('version', 'unknown'),
            'created_at': backup_data.get('created_at', 'unknown'),
            'tables': {},
            'summary': {
                'total_records': 0,
                'existing_records': 0,
                'new_records': 0,
                'tables_count': 0,
            }
        }

        for key, records in backup_data['tables'].items():
            app_label, model_name = key.rsplit('.', 1)
            Model = get_model_safe(app_label, model_name)

            table_info = {
                'key': key,
                'model': model_name,
                'app': app_label,
                'total': len(records),
                'existing': 0,
                'new': 0,
                'conflicts': [],
                'model_exists': Model is not None,
            }

            if Model is not None:
                for record in records:
                    pk = record.get('pk')
                    exists = Model.objects.filter(pk=pk).exists()
                    if exists:
                        table_info['existing'] += 1
                        # Get a display name for the conflict
                        try:
                            obj = Model.objects.get(pk=pk)
                            display = str(obj)
                        except Exception:
                            display = f'ID {pk}'
                        table_info['conflicts'].append({
                            'pk': pk,
                            'display': display,
                        })
                    else:
                        table_info['new'] += 1

            preview['tables'][key] = table_info
            preview['summary']['total_records'] += table_info['total']
            preview['summary']['existing_records'] += table_info['existing']
            preview['summary']['new_records'] += table_info['new']

        preview['summary']['tables_count'] = len(preview['tables'])
        return Response(preview)


class RestoreView(APIView):
    """
    POST /api/v1/backup/restore/
    Restores data from a backup JSON file.

    Body (multipart):
      - backup_file: the JSON backup file
      - conflict_strategy: 'overwrite' | 'skip' | 'rename'
        overwrite: existing records are deleted and re-created
        skip:      existing records are left untouched
        rename:    new records get a modified name/slug to avoid collision
    Admin only.
    """
    authentication_classes = [StaffTokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if not (request.user and getattr(request.user, 'role', None) == 'admin'):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        file_obj = request.FILES.get('backup_file')
        strategy = request.data.get('conflict_strategy', 'skip')

        if strategy not in ('overwrite', 'skip', 'rename'):
            return Response(
                {'error': 'conflict_strategy must be overwrite, skip, or rename'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not file_obj:
            return Response({'error': 'No backup file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            raw = file_obj.read().decode('utf-8')
            backup_data = json.loads(raw)
        except Exception as e:
            return Response({'error': f'Invalid backup file: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        if 'tables' not in backup_data:
            return Response({'error': 'Invalid backup format'}, status=status.HTTP_400_BAD_REQUEST)

        results = {
            'strategy': strategy,
            'tables': {},
            'summary': {
                'created': 0,
                'overwritten': 0,
                'skipped': 0,
                'renamed': 0,
                'errors': 0,
            }
        }

        try:
            with transaction.atomic():
                for key, records in backup_data['tables'].items():
                    app_label, model_name = key.rsplit('.', 1)
                    Model = get_model_safe(app_label, model_name)

                    table_result = {
                        'created': 0, 'overwritten': 0,
                        'skipped': 0, 'renamed': 0, 'errors': [],
                    }

                    if Model is None:
                        table_result['errors'].append(f'Model {key} not found — skipped')
                        results['tables'][key] = table_result
                        continue

                    for record in records:
                        pk = record.get('pk')
                        fields = record.get('fields', {})

                        try:
                            exists = Model.objects.filter(pk=pk).exists()

                            if not exists:
                                # Always create new records
                                self._create_record(Model, pk, fields)
                                table_result['created'] += 1

                            elif strategy == 'skip':
                                table_result['skipped'] += 1

                            elif strategy == 'overwrite':
                                Model.objects.filter(pk=pk).delete()
                                self._create_record(Model, pk, fields)
                                table_result['overwritten'] += 1

                            elif strategy == 'rename':
                                fields = self._rename_fields(Model, fields)
                                # Insert without the original PK so DB assigns new one
                                self._create_record(Model, None, fields)
                                table_result['renamed'] += 1

                        except Exception as e:
                            table_result['errors'].append(f'PK {pk}: {str(e)}')
                            results['summary']['errors'] += 1

                    results['tables'][key] = table_result
                    results['summary']['created']     += table_result['created']
                    results['summary']['overwritten'] += table_result['overwritten']
                    results['summary']['skipped']     += table_result['skipped']
                    results['summary']['renamed']     += table_result['renamed']

        except Exception as e:
            return Response(
                {'error': f'Restore failed and was rolled back: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(results)

    def _create_record(self, Model, pk, fields):
        """Create a model instance from raw field data."""
        # Remove M2M fields — handle separately
        m2m_fields = {}
        clean_fields = {}

        for field_name, value in fields.items():
            try:
                field = Model._meta.get_field(field_name)
                if field.many_to_many:
                    m2m_fields[field_name] = value
                else:
                    clean_fields[field_name] = value
            except Exception:
                clean_fields[field_name] = value

        if pk is not None:
            obj = Model(pk=pk, **clean_fields)
        else:
            obj = Model(**clean_fields)

        obj.save()

        # Set M2M
        for field_name, pks in m2m_fields.items():
            getattr(obj, field_name).set(pks)

        return obj

    def _rename_fields(self, Model, fields):
        """Add a suffix to unique text fields to avoid collisions."""
        suffix = f'_restored_{datetime.utcnow().strftime("%H%M%S")}'
        renamed = dict(fields)

        for field in Model._meta.get_fields():
            if not hasattr(field, 'unique') or not field.unique:
                continue
            fname = field.name
            if fname not in renamed:
                continue
            val = renamed[fname]
            if not isinstance(val, str):
                continue
            # Truncate to fit max_length if needed
            max_len = getattr(field, 'max_length', None)
            new_val = val + suffix
            if max_len and len(new_val) > max_len:
                new_val = val[:max_len - len(suffix)] + suffix
            renamed[fname] = new_val

        return renamed
