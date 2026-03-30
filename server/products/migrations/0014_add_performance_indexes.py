# Generated migration for performance optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0013_product_frequently_bought_together'),
    ]

    operations = [
        # Add indexes for Product model
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['is_active', '-created_at'], name='product_active_created_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['category', 'is_active'], name='product_cat_active_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['subcategory', 'is_active'], name='product_subcat_active_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['brand', 'is_active'], name='product_brand_active_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['is_bestseller'], name='product_bestseller_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['is_hot_selling'], name='product_hot_selling_idx'),
        ),
        
        # Add indexes for ProductVariant model
        migrations.AddIndex(
            model_name='productvariant',
            index=models.Index(fields=['product', 'is_active'], name='variant_prod_active_idx'),
        ),
        migrations.AddIndex(
            model_name='productvariant',
            index=models.Index(fields=['product', 'is_default'], name='variant_prod_default_idx'),
        ),
        migrations.AddIndex(
            model_name='productvariant',
            index=models.Index(fields=['is_active', 'stock_quantity'], name='variant_active_stock_idx'),
        ),
    ]
