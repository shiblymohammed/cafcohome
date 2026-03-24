# Final migration to drop old models and rename new ones

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0011_migrate_category_data'),
        ('offers', '0006_finalize_offer_relations'),
    ]

    operations = [
        # Remove old foreign key fields from Product
        migrations.RemoveField(
            model_name='product',
            name='collection',
        ),
        migrations.RemoveField(
            model_name='product',
            name='category',
        ),
        
        # Delete old models
        migrations.DeleteModel(
            name='Collection',
        ),
        migrations.DeleteModel(
            name='Category',
        ),
        
        # Rename new models to final names
        migrations.RenameModel(
            old_name='NewCategory',
            new_name='Category',
        ),
        migrations.RenameModel(
            old_name='NewSubcategory',
            new_name='Subcategory',
        ),
        
        # Rename foreign key fields in Product
        migrations.RenameField(
            model_name='product',
            old_name='new_category',
            new_name='category',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='new_subcategory',
            new_name='subcategory',
        ),
        
        # Rename foreign key field in Subcategory
        migrations.RenameField(
            model_name='subcategory',
            old_name='new_category',
            new_name='category',
        ),
        
        # Update table names
        migrations.AlterModelTable(
            name='Category',
            table='categories',
        ),
        migrations.AlterModelTable(
            name='Subcategory',
            table='subcategories',
        ),
        
        # Update model options
        migrations.AlterModelOptions(
            name='Category',
            options={
                'ordering': ['display_order', 'name'],
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.AlterModelOptions(
            name='Subcategory',
            options={
                'ordering': ['display_order', 'name'],
                'verbose_name': 'Subcategory',
                'verbose_name_plural': 'Subcategories',
            },
        ),
        
        # Make foreign keys non-nullable
        migrations.AlterField(
            model_name='product',
            name='category',
            field=models.ForeignKey(on_delete=models.CASCADE, related_name='products', to='products.category'),
        ),
        migrations.AlterField(
            model_name='product',
            name='subcategory',
            field=models.ForeignKey(on_delete=models.CASCADE, related_name='products', to='products.subcategory'),
        ),
        migrations.AlterField(
            model_name='subcategory',
            name='category',
            field=models.ForeignKey(on_delete=models.CASCADE, related_name='subcategories', to='products.category'),
        ),
    ]