from django.core.management.base import BaseCommand
from products.models import Product, ProductVariant


class Command(BaseCommand):
    help = 'Generate product variants from existing product colors and materials'

    def add_arguments(self, parser):
        parser.add_argument(
            '--product-id',
            type=int,
            help='Generate variants for a specific product ID',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating variants',
        )

    def handle(self, *args, **options):
        product_id = options.get('product_id')
        dry_run = options.get('dry_run', False)

        if product_id:
            products = Product.objects.filter(id=product_id)
            if not products.exists():
                self.stdout.write(self.style.ERROR(f'Product with ID {product_id} not found'))
                return
        else:
            products = Product.objects.filter(is_active=True)

        total_created = 0
        total_skipped = 0

        for product in products:
            self.stdout.write(f'\nProcessing: {product.name}')
            
            # Check if product has colors and materials
            if not product.colors or not product.materials:
                self.stdout.write(self.style.WARNING(f'  Skipped: No colors or materials defined'))
                total_skipped += 1
                continue

            # Generate variants for each color-material combination
            variants_created = 0
            for color in product.colors:
                for material in product.materials:
                    # Check if variant already exists
                    existing = ProductVariant.objects.filter(
                        product=product,
                        color=color,
                        material=material
                    ).exists()

                    if existing:
                        self.stdout.write(f'  Skipped: {color} / {material} (already exists)')
                        continue

                    if dry_run:
                        self.stdout.write(self.style.WARNING(f'  Would create: {color} / {material}'))
                        variants_created += 1
                    else:
                        # Create variant with product's base pricing
                        variant = ProductVariant.objects.create(
                            product=product,
                            color=color,
                            material=material,
                            mrp=product.mrp,
                            price=product.price,
                            stock_quantity=product.stock_quantity // (len(product.colors) * len(product.materials)),
                            low_stock_threshold=product.low_stock_threshold,
                            images=product.images,
                            is_active=True,
                            is_default=(variants_created == 0)  # First variant is default
                        )
                        self.stdout.write(self.style.SUCCESS(f'  Created: {variant.sku} - {color} / {material}'))
                        variants_created += 1

            if variants_created > 0:
                total_created += variants_created
                self.stdout.write(self.style.SUCCESS(f'  Total variants for {product.name}: {variants_created}'))
            else:
                total_skipped += 1

        self.stdout.write('\n' + '='*50)
        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY RUN: Would create {total_created} variants'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully created {total_created} variants'))
        self.stdout.write(f'Skipped {total_skipped} products')
