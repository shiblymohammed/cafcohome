# Create new Category and Subcategory models alongside existing ones

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0009_remove_variant_fields_from_product'),
    ]

    operations = [
        # Create new Category model (will replace Collection)
        migrations.CreateModel(
            name='NewCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(db_index=True, max_length=100, unique=True)),
                ('subtitle', models.CharField(blank=True, default='', help_text='Short tagline for the category', max_length=200)),
                ('description', models.TextField()),
                ('image_url', models.URLField(blank=True, default='', max_length=500)),
                ('display_order', models.IntegerField(default=0)),
                ('is_featured', models.BooleanField(default=False, help_text='Show as featured category')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'New Category',
                'verbose_name_plural': 'New Categories',
                'db_table': 'new_categories',
                'ordering': ['display_order', 'name'],
            },
        ),
        
        # Create new Subcategory model (will replace Category)
        migrations.CreateModel(
            name='NewSubcategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(db_index=True, max_length=100, unique=True)),
                ('description', models.TextField()),
                ('image_url', models.URLField(blank=True, default='', max_length=500)),
                ('featured_icon_url', models.URLField(blank=True, default='', help_text='Icon/SVG for featured subcategory display', max_length=500)),
                ('display_order', models.IntegerField(default=0)),
                ('is_featured', models.BooleanField(default=False, help_text='Show in featured subcategories section')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('new_category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='new_subcategories', to='products.newcategory')),
            ],
            options={
                'verbose_name': 'New Subcategory',
                'verbose_name_plural': 'New Subcategories',
                'db_table': 'new_subcategories',
                'ordering': ['display_order', 'name'],
            },
        ),
        
        # Add new foreign key fields to Product model
        migrations.AddField(
            model_name='product',
            name='new_category',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='new_products', to='products.newcategory'),
        ),
        migrations.AddField(
            model_name='product',
            name='new_subcategory',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='new_products', to='products.newsubcategory'),
        ),
    ]