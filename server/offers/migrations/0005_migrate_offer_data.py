# Data migration to copy offer relations to new models

from django.db import migrations


def migrate_offer_data_forward(apps, schema_editor):
    Offer = apps.get_model('offers', 'Offer')
    
    for offer in Offer.objects.all():
        # Copy collections to new_collections
        for collection in offer.collections.all():
            offer.new_collections.add(collection.id)
        
        # Copy categories to new_categories
        for category in offer.categories.all():
            offer.new_categories.add(category.id)


def migrate_offer_data_reverse(apps, schema_editor):
    Offer = apps.get_model('offers', 'Offer')
    
    for offer in Offer.objects.all():
        # Copy new_collections back to collections
        for new_collection in offer.new_collections.all():
            offer.collections.add(new_collection.id)
        
        # Copy new_categories back to categories
        for new_category in offer.new_categories.all():
            offer.categories.add(new_category.id)


class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0004_update_offer_relations'),
        ('products', '0011_migrate_category_data'),
    ]

    operations = [
        migrations.RunPython(migrate_offer_data_forward, migrate_offer_data_reverse),
    ]