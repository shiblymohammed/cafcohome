# Final migration to update offer relations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0005_migrate_offer_data'),
    ]

    operations = [
        # Remove old foreign key fields
        migrations.RemoveField(
            model_name='offer',
            name='collections',
        ),
        migrations.RemoveField(
            model_name='offer',
            name='categories',
        ),
        
        # Rename new fields to final names
        migrations.RenameField(
            model_name='offer',
            old_name='new_collections',
            new_name='collections',
        ),
        migrations.RenameField(
            model_name='offer',
            old_name='new_categories',
            new_name='categories',
        ),
        
        # Update field definitions to point to renamed models
        migrations.AlterField(
            model_name='offer',
            name='collections',
            field=models.ManyToManyField(blank=True, related_name='offers', to='products.newcategory'),
        ),
        migrations.AlterField(
            model_name='offer',
            name='categories',
            field=models.ManyToManyField(blank=True, related_name='offers', to='products.newsubcategory'),
        ),
    ]