# CAFCO Home - Database Structure & Admin Panel Flow

## 📊 Database Overview

The database has been cleared and populated with realistic, well-structured furniture e-commerce data.

### Data Summary
- **Colors**: 32 (Neutrals, Browns/Woods, Blues, Greens, Warm Colors, Pastels)
- **Materials**: 18 (Wood types, Fabrics, Metals, Glass, Marble, etc.)
- **Brands**: 8 (Urban Ladder, Pepperfry, Godrej Interio, Durian, etc.)
- **Categories**: 5 (Living Room, Bedroom, Dining Room, Office, Outdoor)
- **Subcategories**: 20 (Sofas, Beds, Dining Tables, Office Chairs, etc.)
- **Products**: 15 (Realistic furniture items)
- **Product Variants**: 25 (Different color/material combinations)
- **Offers**: 6 (Active promotional offers)
- **Blog Posts**: 6 (Published furniture guides)

---

## 🏗️ Data Structure Hierarchy

```
Category (e.g., Living Room)
  └── Subcategory (e.g., Sofas)
      └── Product (e.g., Valencia 3-Seater Sofa)
          └── Variant 1 (Velvet - Navy Blue)
              ├── Images (4 images)
              ├── Price: ₹42,999 (MRP: ₹54,999)
              └── Stock: 15 units
          └── Variant 2 (Velvet - Emerald Green)
              ├── Images (4 images)
              ├── Price: ₹42,999 (MRP: ₹54,999)
              └── Stock: 12 units
          └── Variant 3 (Linen - Beige)
              ├── Images (4 images)
              ├── Price: ₹39,999 (MRP: ₹49,999)
              └── Stock: 20 units
```

---

## 🎯 Admin Panel Flow

### 1. **Adding a Product** (Step-by-Step)

#### **Step 1: Basic Information**
1. Navigate to **Products** page
2. Click **"Add Product"** button
3. Fill in basic details:
   - **Product Name**: e.g., "Valencia 3-Seater Sofa"
   - **Description**: Detailed product description
   - **Dimensions**: Length, Width, Height, Unit (cm/inches)
   - **Category**: Select from dropdown (e.g., "Living Room")
   - **Subcategory**: Select from dropdown (e.g., "Sofas")
   - **Brand**: Optional, select from dropdown
   
4. **Add Material-Color Combinations**:
   - Select a **Material** (e.g., "Velvet Fabric")
   - Select one or more **Colors** (e.g., "Navy Blue", "Emerald Green")
   - Click **"Add Combination"**
   - Repeat for different materials
   - Each combination will create a product variant

5. Click **"Next"** to proceed

#### **Step 2: Upload Images**
- For each variant created in Step 1:
  - Upload 3-5 images per variant
  - Images should show different angles
  - First image becomes the thumbnail
- Click **"Next"**

#### **Step 3: Pricing & Stock**
- For each variant:
  - **MRP** (Maximum Retail Price): Original price
  - **Selling Price**: Discounted price (must be ≤ MRP)
  - **Stock Quantity**: Available units
  - **Low Stock Threshold**: Alert level (default: 5)
  - **Set as Default**: Mark one variant as default display
- Click **"Next"**

#### **Step 4: Product Attributes**
- **Bestseller**: Mark if product is a bestseller
- **Hot Selling**: Mark if product is trending
- **Active**: Enable/disable product visibility
- **Frequently Bought Together**: Select related products
- Click **"Submit"** to create product

---

### 2. **Managing Categories**

#### **Categories** (Top-level grouping)
- **Examples**: Living Room, Bedroom, Dining Room, Office, Outdoor
- **Fields**:
  - Name
  - Subtitle (tagline)
  - Description
  - Image URL (category banner)
  - Display Order (sorting)
  - Featured (show on homepage)
  - Active status

#### **Subcategories** (Product types within categories)
- **Examples**: Sofas, Beds, Dining Tables, Office Chairs
- **Fields**:
  - Name
  - Parent Category
  - Description
  - Image URL
  - Featured Icon URL (for homepage display)
  - Display Order
  - Featured status
  - Active status

---

### 3. **Managing Colors & Materials**

#### **Colors**
- Global color palette available for all products
- **Fields**:
  - Name (e.g., "Navy Blue")
  - Hex Code (e.g., "#000080")
  - Active status
- **32 colors available** covering all furniture needs

#### **Materials**
- Global material options for all products
- **Fields**:
  - Name (e.g., "Velvet Fabric")
  - Description
  - Active status
- **18 materials available** including woods, fabrics, metals

---

### 4. **Managing Offers**

#### **Offer Types**
1. **Product-specific**: Apply to selected products
2. **Category-level**: Apply to all products in a category
3. **Subcategory-level**: Apply to all products in a subcategory
4. **Brand-level**: Apply to all products from a brand

#### **Offer Fields**
- Name
- Description
- Image URL (promotional banner)
- Discount Percentage (0-100%)
- Apply To (product/category/subcategory/brand)
- Selected Items (based on "Apply To" type)
- Start Date & End Date
- Active status
- Featured (show on homepage - max 4)

#### **Current Offers**
1. Mega Living Room Sale (25% off - Category)
2. Bedroom Bonanza (20% off - Category)
3. Sofa Spectacular (30% off - Subcategory)
4. Urban Ladder Brand Days (15% off - Brand)
5. Clearance Sale - Beds (35% off - Subcategory)
6. Festive Home Makeover (18% off - Multiple Categories)

---

### 5. **Managing Blog Posts**

#### **Blog Fields**
- Title
- Slug (auto-generated from title)
- Content (Rich text HTML)
- Excerpt (summary)
- Featured Image URL
- Author (Staff member)
- Meta Title (SEO)
- Meta Description (SEO)
- Status (Draft/Published)
- Featured (show on homepage)
- Published Date

#### **Current Blog Posts**
1. 10 Tips for Choosing the Perfect Sofa
2. Small Space Living: Furniture Solutions
3. Bedroom Makeover: Creating Your Sanctuary
4. Work From Home: Ergonomic Home Office Setup
5. Dining Room Design: Perfect Gathering Space
6. Furniture Care 101: Maintaining Your Investment

---

## 📦 Current Product Inventory

### **Living Room (8 products)**

#### **Sofas (3)**
1. **Valencia 3-Seater Sofa** - Urban Ladder
   - Variants: Velvet Navy, Velvet Emerald, Linen Beige
   - Price Range: ₹39,999 - ₹42,999
   - Bestseller ✓ | Hot Selling ✓

2. **Modena L-Shaped Sectional Sofa** - Durian
   - Variants: Leather Charcoal, Velvet Gray
   - Price Range: ₹67,999 - ₹74,999
   - Bestseller ✓

3. **Compact 2-Seater Loveseat** - Pepperfry
   - Variants: Linen Gray, Linen Beige
   - Price: ₹24,999
   - Hot Selling ✓

#### **Coffee Tables (3)**
4. **Industrial Metal & Wood Coffee Table** - Urban Ladder
   - Variant: Mango Wood Natural
   - Price: ₹13,999
   - Bestseller ✓ | Hot Selling ✓

5. **Luxury Marble Top Coffee Table** - Durian
   - Variants: White Marble, Black Marble
   - Price: ₹29,999
   - Bestseller ✓

6. **Minimalist Glass Coffee Table** - Pepperfry
   - Variant: Black Glass
   - Price: ₹7,999
   - Hot Selling ✓

### **Bedroom (3 products)**

#### **Beds (3)**
7. **Royale King Size Bed with Storage** - Godrej Interio
   - Variants: Sheesham Walnut, Sheesham Natural
   - Price: ₹52,999
   - Bestseller ✓ | Hot Selling ✓

8. **Nordic Queen Size Platform Bed** - Urban Ladder
   - Variants: Oak Natural, Oak White
   - Price: ₹38,999
   - Bestseller ✓

9. **Classic Single Bed** - Nilkamal
   - Variants: Engineered Wood White, Engineered Wood Walnut
   - Price: ₹14,999
   - Hot Selling ✓

### **Dining Room (3 products)**

#### **Dining Tables (3)**
10. **Farmhouse 6-Seater Dining Table** - HomeTown
    - Variants: Mango Natural, Mango Walnut
    - Price: ₹35,999
    - Bestseller ✓ | Hot Selling ✓

11. **Modern Glass Top 4-Seater Dining Table** - Pepperfry
    - Variant: Black Glass
    - Price: ₹19,999
    - Hot Selling ✓

12. **Grand 8-Seater Extendable Dining Table** - Durian
    - Variant: Sheesham Walnut
    - Price: ₹59,999
    - Bestseller ✓

### **Office (3 products)**

#### **Office Chairs (3)**
13. **ErgoMax Executive Office Chair** - Wakefit
    - Variants: Mesh Black, Mesh Gray
    - Price: ₹11,999
    - Bestseller ✓ | Hot Selling ✓

14. **Luxury Leather Boss Chair** - Godrej Interio
    - Variant: Leather Black
    - Price: ₹21,999
    - Bestseller ✓

15. **Budget Study Chair** - Nilkamal
    - Variant: Faux Leather Black
    - Price: ₹4,499
    - Hot Selling ✓

---

## 🎨 Color Palette (32 Colors)

### Neutrals
- White, Ivory, Beige, Cream, Light Gray, Gray, Charcoal, Black

### Browns & Woods
- Natural Wood, Walnut Brown, Oak Brown, Mahogany, Espresso, Teak

### Blues
- Navy Blue, Royal Blue, Sky Blue, Teal, Turquoise

### Greens
- Emerald Green, Olive Green, Sage Green, Forest Green

### Warm Colors
- Burgundy, Maroon, Rust, Terracotta, Mustard Yellow, Gold

### Pastels
- Blush Pink, Lavender, Mint Green

---

## 🪵 Materials (18 Types)

### Wood
- Solid Wood, Engineered Wood, Sheesham Wood, Mango Wood, Teak Wood, Oak Wood, Plywood

### Fabrics
- Velvet Fabric, Linen Fabric, Cotton Fabric, Microfiber

### Leather
- Leather, Faux Leather

### Others
- Metal Frame, Rattan, Cane, Marble, Glass

---

## 🏷️ Brands (8)

1. **Urban Ladder** - Contemporary furniture for modern homes
2. **Pepperfry** - Stylish and affordable solutions
3. **Godrej Interio** - Trusted Indian quality brand
4. **Durian** - Premium Italian-influenced designs
5. **HomeTown** - Complete home solutions
6. **Nilkamal** - Leading plastic and furniture manufacturer
7. **Wakefit** - Innovative sleep and furniture
8. **IKEA** - Swedish affordable modern designs

---

## 🔄 Product Flags

### **Bestseller** (8 products)
Products marked as bestsellers appear in the "Bestsellers" section on the homepage.

### **Hot Selling** (9 products)
Trending products appear in the "Hot Selling" section on the homepage.

---

## 📸 Image Structure

Each product variant has 3-5 images with:
- **URL**: Cloudinary hosted image
- **Alt Text**: SEO-friendly description
- **Order**: Display sequence

**Image URL Pattern**:
```
https://res.cloudinary.com/djlgcbpkq/image/upload/v1/products/{product-slug}/variant-{index}-img-{number}.jpg
```

---

## 💡 Tips for Admin Panel Usage

### Adding Products
1. **Always start with Categories and Subcategories** before adding products
2. **Create Colors and Materials** first if new ones are needed
3. **Add Brands** before assigning them to products
4. **Use descriptive names** for better searchability
5. **Upload high-quality images** (recommended: 1200x1200px)
6. **Set realistic stock levels** for inventory management

### Managing Variants
- Each product can have multiple variants (color/material combinations)
- **One variant must be marked as default** for display
- Variants can have different prices and stock levels
- Each variant should have its own set of images

### Offers Strategy
- **Maximum 4 featured offers** can be displayed on homepage
- Offers can overlap (multiple offers on same product)
- Set realistic date ranges for offers
- Use compelling images and descriptions

### Blog Content
- Write SEO-friendly titles and meta descriptions
- Use rich HTML content with headings and formatting
- Add relevant featured images
- Mark important posts as "Featured" for homepage display

---

## 🚀 Quick Start Commands

### Clear and Reseed Database
```bash
cd cafcohome/server
.\venv\Scripts\python.exe seed_furniture_data.py
.\venv\Scripts\python.exe seed_products.py
.\venv\Scripts\python.exe seed_offers_blogs.py
```

### Access Admin Panel
- **URL**: http://localhost:5173
- **Products**: http://localhost:5173/products
- **Categories**: http://localhost:5173/categories
- **Offers**: http://localhost:5173/offers
- **Blog**: http://localhost:5173/blog

### Access User Storefront
- **URL**: http://localhost:3000

### Access Backend API
- **URL**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/api/v1/

---

## ✅ Data Quality Features

### Realistic Data
- ✓ Real furniture product names and descriptions
- ✓ Market-appropriate pricing (₹4,499 - ₹74,999)
- ✓ Realistic stock quantities (8-50 units)
- ✓ Proper dimensions in cm
- ✓ Authentic brand names and descriptions

### SEO Optimized
- ✓ Auto-generated slugs for URLs
- ✓ Meta titles and descriptions for blog posts
- ✓ Alt text for all images
- ✓ Descriptive product content

### E-commerce Ready
- ✓ Multiple variants per product
- ✓ Stock management
- ✓ Discount calculations (MRP vs Price)
- ✓ Low stock thresholds
- ✓ Product flags (bestseller, hot selling)
- ✓ Active/inactive status for all entities

---

## 📞 Support

For any issues or questions about the database structure or admin panel:
1. Check this documentation first
2. Review the seed scripts for data examples
3. Test in the admin panel at http://localhost:5173

**Happy Selling! 🛋️🏠**
