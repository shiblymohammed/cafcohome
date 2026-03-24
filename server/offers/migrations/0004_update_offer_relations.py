# Update Offer model to use new Category and Subcategory models

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0003_alter_offer_options_alter_offer_is_featured_and_more'),
        ('products', '0011_migrate_category_data'),
    ]

    operations = [
        # Add new foreign key fields
        migrations.AddField(
            model_name='offer',
            name='new_collections',
            field=models.ManyToManyField(blank=True, related_name='new_offers', to='products.newcategory'),
        ),
        migrations.AddField(
            model_name='offer',
            name='new_categories',
            field=models.ManyToManyField(blank=True, related_name='new_offers', to='products.newsubcategory'),
        ),
    ]