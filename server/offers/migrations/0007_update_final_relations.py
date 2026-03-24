# Update offer relations to final model names

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0006_finalize_offer_relations'),
        ('products', '0012_finalize_category_restructure'),
    ]

    operations = [
        # Update field definitions to point to final model names
        migrations.AlterField(
            model_name='offer',
            name='collections',
            field=models.ManyToManyField(blank=True, related_name='offers', to='products.category'),
        ),
        migrations.AlterField(
            model_name='offer',
            name='categories',
            field=models.ManyToManyField(blank=True, related_name='offers', to='products.subcategory'),
        ),
    ]