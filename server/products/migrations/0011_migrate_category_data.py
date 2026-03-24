# Data migration to copy data from old models to new models

from django.db import migrations


def migrate_data_forward(apps, schema_editor):
    # Get model classes
    Collection = apps.get_model('products', 'Collection')
    Category = apps.get_model('products', 'Category')
    Product = apps.get_model('products', 'Product')
    NewCategory = apps.get_model('products', 'NewCategory')
    NewSubcategory = apps.get_model('products', 'NewSubcategory')
    
    # Copy Collections to NewCategories
    for collection in Collection.objects.all():
        new_category = NewCategory.objects.create(
            id=collection.id,
            name=collection.name,
            slug=collection.slug,
            subtitle=collection.subtitle,
            description=collection.description,
            image_url=collection.image_url,
            display_order=collection.display_order,
            is_featured=collection.is_featured,
            is_active=collection.is_active,
            created_at=collection.created_at,
            updated_at=collection.updated_at,
        )
    
    # Copy Categories to NewSubcategories
    for category in Category.objects.all():
        new_subcategory = NewSubcategory.objects.create(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            image_url=category.image_url,
            featured_icon_url=category.featured_icon_url,
            display_order=category.display_order,
            is_featured=category.is_featured,
            is_active=category.is_active,
            created_at=category.created_at,
            updated_at=category.updated_at,
            new_category_id=category.collection_id,  # Map to new category
        )
    
    # Update Product foreign keys
    for product in Product.objects.all():
        product.new_category_id = product.collection_id
        product.new_subcategory_id = product.category_id
        product.save(update_fields=['new_category_id', 'new_subcategory_id'])


def migrate_data_reverse(apps, schema_editor):
    # Reverse migration - copy data back
    Collection = apps.get_model('products', 'Collection')
    Category = apps.get_model('products', 'Category')
    Product = apps.get_model('products', 'Product')
    NewCategory = apps.get_model('products', 'NewCategory')
    NewSubcategory = apps.get_model('products', 'NewSubcategory')
    
    # Copy NewCategories back to Collections
    for new_category in NewCategory.objects.all():
        Collection.objects.update_or_create(
            id=new_category.id,
            defaults={
                'name': new_category.name,
                'slug': new_category.slug,
                'subtitle': new_category.subtitle,
                'description': new_category.description,
                'image_url': new_category.image_url,
                'display_order': new_category.display_order,
                'is_featured': new_category.is_featured,
                'is_active': new_category.is_active,
                'created_at': new_category.created_at,
                'updated_at': new_category.updated_at,
            }
        )
    
    # Copy NewSubcategories back to Categories
    for new_subcategory in NewSubcategory.objects.all():
        Category.objects.update_or_create(
            id=new_subcategory.id,
            defaults={
                'name': new_subcategory.name,
                'slug': new_subcategory.slug,
                'description': new_subcategory.description,
                'image_url': new_subcategory.image_url,
                'featured_icon_url': new_subcategory.featured_icon_url,
                'display_order': new_subcategory.display_order,
                'is_featured': new_subcategory.is_featured,
                'is_active': new_subcategory.is_active,
                'created_at': new_subcategory.created_at,
                'updated_at': new_subcategory.updated_at,
                'collection_id': new_subcategory.new_category_id,
            }
        )
    
    # Update Product foreign keys back
    for product in Product.objects.all():
        product.collection_id = product.new_category_id
        product.category_id = product.new_subcategory_id
        product.save(update_fields=['collection_id', 'category_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0010_create_new_category_models'),
    ]

    operations = [
        migrations.RunPython(migrate_data_forward, migrate_data_reverse),
    ]