# Adding New Products - Quick Start Guide

## 📋 Step-by-Step Process

### Step 1: Add Categories & Subcategories

**Admin Panel**: Navigate to `Categories` in the sidebar

1. Click "Add Category"
2. Fill in:
   - Name (e.g., "Living Room")
   - Slug (auto-generated)
   - Description (optional)
   - Upload image (optional)
   - Set as active
3. Click "Save"

4. For each category, add subcategories:
   - Click "Add Subcategory"
   - Select parent category
   - Fill in name (e.g., "Sofas")
   - Add description
   - Upload image
   - Save

**Example Structure**:
```
Living Room
  ├── Sofas (3-seater, 2-seater, L-shaped)
  ├── Chairs (Accent chairs, Recliners)
  ├── Coffee Tables
  ├── TV Units
  └── Side Tables

Bedroom
  ├── Beds (King, Queen, Single)
  ├── Wardrobes
  ├── Nightstands
  └── Dressers

Dining
  ├── Dining Tables (4-seater, 6-seater, 8-seater)
  ├── Dining Chairs
  └── Buffets & Sideboards

Office
  ├── Office Desks
  ├── Office Chairs
  └── Bookcases
```

---

### Step 2: Add Brands

**Admin Panel**: Navigate to `Brands` in the sidebar

1. Click "Add Brand"
2. Fill in:
   - Name (e.g., "Urban Ladder")
   - Slug (auto-generated)
   - Description
   - Upload logo
   - Set as active
3. Save

**Example Brands**:
- Urban Ladder
- Pepperfry
- IKEA
- Godrej Interio
- Durian
- Nilkamal
- @home
- HomeTown

---

### Step 3: Add Colors

**Admin Panel**: Navigate to `Materials & Colors` → `Colors` tab

1. Click "Add Color"
2. Fill in:
   - Name (e.g., "Walnut Brown")
   - Hex Code (e.g., "#8B4513")
   - Set as active
3. Save

**Common Furniture Colors**:
```
Wood Tones:
- Walnut Brown (#5C4033)
- Oak Natural (#C19A6B)
- Mahogany (#C04000)
- Teak (#B8860B)
- Wenge Dark (#3D3635)

Neutrals:
- White (#FFFFFF)
- Off-White (#F5F5F5)
- Black (#000000)
- Gray (#808080)
- Beige (#F5F5DC)

Accent Colors:
- Navy Blue (#000080)
- Emerald Green (#50C878)
- Burgundy (#800020)
- Mustard Yellow (#FFDB58)
```

---

### Step 4: Add Materials

**Admin Panel**: Navigate to `Materials & Colors` → `Materials` tab

1. Click "Add Material"
2. Fill in:
   - Name (e.g., "Solid Sheesham Wood")
   - Description
   - Set as active
3. Save

**Common Furniture Materials**:
```
Wood:
- Solid Sheesham Wood
- Solid Teak Wood
- Solid Mango Wood
- Engineered Wood (MDF)
- Plywood
- Particle Board

Upholstery:
- Fabric (Cotton, Linen, Velvet)
- Leather (Genuine, Faux)
- Leatherette

Other:
- Metal (Steel, Iron, Aluminum)
- Glass (Tempered)
- Marble
- Rattan/Cane
```

---

### Step 5: Add Products

**Admin Panel**: Navigate to `Products` in the sidebar

1. Click "Add Product"
2. Fill in **Basic Information**:
   - Name: "Modern L-Shaped Sofa"
   - Slug: (auto-generated)
   - Category: Living Room
   - Subcategory: Sofas
   - Brand: Urban Ladder (optional)

3. Fill in **Description**:
   - Short description (for listings)
   - Full description (for product page)
   - Use rich text editor for formatting

4. Add **Specifications**:
   - Dimensions: "220cm (L) x 150cm (W) x 85cm (H)"
   - Weight: "75 kg"
   - Seating Capacity: "5-6 people"
   - Assembly Required: Yes/No
   - Warranty: "1 year manufacturer warranty"

5. Add **Features** (one per line):
   ```
   High-density foam cushions
   Removable cushion covers
   Sturdy wooden frame
   Anti-skid legs
   Easy to clean fabric
   ```

6. Add **Care Instructions**:
   ```
   Vacuum regularly
   Spot clean with mild detergent
   Avoid direct sunlight
   Professional cleaning recommended annually
   ```

7. **SEO Settings** (optional):
   - Meta title
   - Meta description
   - Keywords

8. Set **Status**:
   - Is Active: ✓
   - Is Featured: ✓ (for homepage)
   - Is New Arrival: ✓ (if applicable)

9. Click "Save"

---

### Step 6: Add Product Variants

After saving the product, add variants:

1. In the product detail page, click "Add Variant"
2. Fill in **Variant Details**:
   - Color: Walnut Brown
   - Material: Solid Sheesham Wood
   - SKU: "LSF-WAL-SSH-001" (unique code)

3. Set **Pricing**:
   - MRP: ₹89,999
   - Selling Price: ₹69,999
   - Cost Price: ₹45,000 (for inventory tracking)

4. Set **Stock**:
   - Stock Quantity: 10
   - Low Stock Threshold: 3
   - Reorder Point: 5
   - Reorder Quantity: 10

5. Add **Variant Images**:
   - Upload multiple images
   - Set one as primary
   - Images should be high quality (min 1000x1000px)

6. Set **Status**:
   - Is Active: ✓
   - Is Default: ✓ (for first variant)

7. Click "Save"

8. **Repeat** for other color/material combinations:
   - Gray Fabric variant
   - Black Leather variant
   - etc.

---

### Step 7: Upload Product Images

**Image Guidelines**:
- Format: JPG or PNG
- Size: 1000x1000px minimum (square)
- Background: White or lifestyle setting
- Multiple angles: Front, side, detail shots
- Lifestyle images showing product in use

**For Each Variant**:
1. Upload 4-6 images
2. Set display order
3. Mark one as primary/thumbnail

---

### Step 8: Set Up Inventory (Automatic)

Once variants are created with stock quantities:
- ✅ Inventory tracking starts automatically
- ✅ Alerts generated when stock is low
- ✅ Stock movements logged
- ✅ Available quantity calculated

**Monitor Inventory**:
- Dashboard: `/inventory`
- Stock Management: `/stock-management`
- Alerts: `/stock-alerts`

---

## 🎯 Quick Product Entry Checklist

For each product:
- [ ] Category & Subcategory selected
- [ ] Product name and description added
- [ ] Dimensions and specifications filled
- [ ] Features and care instructions added
- [ ] At least 1 variant created
- [ ] Variant has color and material
- [ ] Unique SKU assigned
- [ ] MRP and selling price set
- [ ] Cost price added (for inventory)
- [ ] Stock quantity set
- [ ] Reorder point configured
- [ ] 4-6 images uploaded
- [ ] Primary image selected
- [ ] Product set as active
- [ ] Tested on frontend

---

## 💡 Pro Tips

### Naming Convention
```
Product Name: [Type] [Style] [Key Feature]
Examples:
- "Modern L-Shaped Sofa with Storage"
- "Solid Wood King Size Bed with Headboard"
- "Glass Top Dining Table 6-Seater"
```

### SKU Format
```
[CATEGORY]-[SUBCATEGORY]-[COLOR]-[MATERIAL]-[NUMBER]
Examples:
- LIV-SOF-WAL-SSH-001
- BED-BED-WHT-ENG-002
- DIN-TAB-BLK-GLS-003
```

### Pricing Strategy
```
MRP: Original price (higher)
Selling Price: Discounted price (what customer pays)
Cost Price: Your purchase/manufacturing cost

Example:
MRP: ₹89,999 (40% margin)
Selling Price: ₹69,999 (22% margin)
Cost Price: ₹45,000
```

### Stock Levels
```
Low Stock Threshold: When to show "Low Stock" badge
Reorder Point: When to generate alert
Reorder Quantity: How much to order

Example:
Stock: 10 units
Low Stock Threshold: 3 units
Reorder Point: 5 units
Reorder Quantity: 10 units
```

### Image Optimization
- Use image compression tools
- Keep file size under 500KB per image
- Use descriptive filenames
- Add alt text for SEO

---

## 🔄 Bulk Import (Advanced)

If you have many products, consider:

1. **Create CSV Template**:
   ```csv
   name,category,subcategory,brand,description,dimensions,mrp,price
   "Modern Sofa","Living Room","Sofas","Urban Ladder","...",220x150x85,89999,69999
   ```

2. **Use Django Admin Import**:
   - Install django-import-export
   - Create import template
   - Upload CSV file

3. **Or Create Custom Script**:
   ```python
   # products/management/commands/import_products.py
   ```

---

## 📊 After Adding Products

### 1. Verify on Frontend
- Check product listing pages
- Test product detail pages
- Verify images load correctly
- Test add to cart functionality

### 2. Check Inventory
- Go to `/inventory` dashboard
- Verify stock levels are correct
- Check if alerts are generated for low stock

### 3. Test Search
- Search for products by name
- Filter by category
- Filter by price range

### 4. Create Offers (Optional)
- Category-wide discounts
- Brand-specific offers
- Product-specific deals

---

## 🆘 Common Issues

### Issue: Images not showing
**Solution**: 
- Check file path in media folder
- Verify MEDIA_URL and MEDIA_ROOT settings
- Ensure images are uploaded correctly

### Issue: Product not appearing on frontend
**Solution**:
- Check "Is Active" is enabled
- Verify at least one variant exists
- Ensure variant is active
- Check stock quantity > 0

### Issue: SKU already exists
**Solution**:
- Each variant needs unique SKU
- Use consistent naming convention
- Check existing SKUs before adding

### Issue: Stock not tracking
**Solution**:
- Verify cost_price is set
- Check inventory app is installed
- Run migrations if needed

---

## 📞 Need Help?

- Check Django admin logs
- Review error messages
- Test in development first
- Backup before bulk operations

---

## ✅ Success Checklist

After adding all products:
- [ ] All categories created
- [ ] All subcategories added
- [ ] Brands configured
- [ ] Colors and materials set up
- [ ] Products added with descriptions
- [ ] Variants created with pricing
- [ ] Images uploaded and optimized
- [ ] Stock levels configured
- [ ] Inventory tracking working
- [ ] Products visible on frontend
- [ ] Search and filters working
- [ ] Cart functionality tested
- [ ] Checkout process verified

---

**You're now ready to start adding your furniture products! 🎉**
