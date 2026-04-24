# Inventory Management System - Testing Guide

## Prerequisites
1. Backend server running: `python manage.py runserver`
2. Admin panel running: `npm run dev` (in admin folder)
3. Logged in as admin or staff user

## Test Sequence

### 1. Dashboard Access
**URL**: `/inventory`

**Expected**:
- ✅ 8 summary cards displaying metrics
- ✅ Low stock items table (if any)
- ✅ Quick stats section
- ✅ Navigation buttons working

**Test Actions**:
1. Check if all cards show numbers
2. Verify "Active Alerts" count
3. Click "Manage Stock" → Should go to `/stock-management`
4. Click "View Movements" → Should go to `/stock-movements`
5. Click "View Alerts" → Should go to `/stock-alerts`

---

### 2. Stock Management
**URL**: `/stock-management`

**Expected**:
- ✅ Table showing all product variants
- ✅ Search and filter working
- ✅ Stock levels displayed correctly
- ✅ "Adjust" button on each row

**Test Actions**:

#### A. Search Functionality
1. Type product name in search → Results filter
2. Type SKU → Results filter
3. Clear search → All results return

#### B. Filter by Stock Status
1. Select "Low Stock" → Only low stock items show
2. Select "Out of Stock" → Only out of stock items show
3. Select "In Stock" → Only in stock items show
4. Clear filter → All items return

#### C. Stock Adjustment - Restock
1. Click "Adjust" on any product
2. Modal opens with product details
3. Select "Restock (Add Stock)"
4. Enter quantity: 100
5. Enter cost price: 500
6. Add notes: "Test restock"
7. Click "Confirm Adjustment"
8. ✅ Success message appears
9. ✅ Modal closes
10. ✅ Stock quantity updated in table
11. ✅ Page refreshes with new data

#### D. Stock Adjustment - Damage
1. Click "Adjust" on same product
2. Select "Damage/Loss (Reduce Stock)"
3. Enter quantity: 5
4. Add notes: "Test damage"
5. Click "Confirm Adjustment"
6. ✅ Stock reduced by 5
7. ✅ Movement logged

#### E. Stock Adjustment - Manual Adjustment
1. Click "Adjust" on any product
2. Select "Manual Adjustment"
3. Enter quantity: 10
4. Add notes: "Test adjustment"
5. Click "Confirm Adjustment"
6. ✅ Stock increased by 10

#### F. Stock Adjustment - Customer Return
1. Click "Adjust" on any product
2. Select "Customer Return (Add Stock)"
3. Enter quantity: 2
4. Add notes: "Test return"
5. Click "Confirm Adjustment"
6. ✅ Stock increased by 2

---

### 3. Stock Movements
**URL**: `/stock-movements`

**Expected**:
- ✅ Table showing all stock movements
- ✅ Most recent movements at top
- ✅ Color-coded movement types
- ✅ Before → After stock levels shown

**Test Actions**:

#### A. Verify Recent Movements
1. Check if test movements from Step 2 appear
2. Verify movement types are correct:
   - 📦 Restock (green)
   - ⚠️ Damage (red)
   - ⚙️ Adjustment (blue)
   - ↩️ Return (green)
3. Verify quantities match
4. Verify "Before → After" calculations correct
5. Verify notes appear
6. Verify your username appears in "By" column

#### B. Filter by Movement Type
1. Select "Restock" → Only restock movements show
2. Select "Damage" → Only damage movements show
3. Select "Adjustment" → Only adjustments show
4. Clear filter → All movements return

#### C. Search Functionality
1. Search by product name → Results filter
2. Search by SKU → Results filter
3. Search by notes text → Results filter
4. Clear search → All results return

#### D. Date Filter
1. Select today's date → Only today's movements show
2. Select past date → No results (or old movements)
3. Clear date → All movements return

---

### 4. Stock Alerts
**URL**: `/stock-alerts`

**Expected**:
- ✅ Summary stats showing alert counts
- ✅ Table showing active alerts
- ✅ Severity badges color-coded
- ✅ Action buttons available

**Test Actions**:

#### A. Create Low Stock Alert (Manual)
1. Go to Stock Management
2. Find a product with stock > 10
3. Click "Adjust"
4. Select "Damage/Loss"
5. Enter quantity to bring stock below 10
6. Confirm adjustment
7. Go to Stock Alerts
8. ✅ New alert should appear

#### B. Alert Display
1. Verify alert shows:
   - Product name
   - SKU
   - Variant details
   - Alert type (Low Stock, Out of Stock, etc.)
   - Severity badge
   - Current stock vs threshold
   - "Active" status

#### C. Restock from Alert
1. Click "Restock" button on an alert
2. ✅ Should navigate to Stock Management with variant pre-selected
3. ✅ Adjustment modal should open automatically
4. Add stock to bring above threshold
5. Confirm adjustment
6. Go back to Stock Alerts
7. ✅ Alert should be auto-resolved or gone

#### D. Manual Alert Resolution
1. Find an active alert
2. Click "Resolve" button
3. Confirm resolution
4. ✅ Alert marked as resolved
5. ✅ Your username appears in "Resolved by"
6. ✅ Timestamp appears

#### E. Show Resolved Alerts
1. Check "Show Resolved" checkbox
2. ✅ Resolved alerts appear (grayed out)
3. ✅ Resolution details shown
4. Uncheck "Show Resolved"
5. ✅ Only active alerts show

#### F. Filter by Severity
1. Select "Critical" → Only critical alerts show
2. Select "High" → Only high priority alerts show
3. Select "Medium" → Only medium alerts show
4. Clear filter → All alerts return

---

### 5. Integration with Orders (If Orders Exist)

#### A. Order Creation → Stock Reservation
1. Go to user frontend
2. Add products to cart
3. Complete checkout
4. Go to admin Stock Movements
5. ✅ Should see "Reservation" movement (🔒)
6. ✅ Quantity should be negative
7. ✅ Reference should be order number
8. Go to Stock Management
9. ✅ "Reserved" column should show reserved quantity
10. ✅ "Available" should be reduced

#### B. Order Completion → Stock Reduction
1. Go to admin Orders
2. Find the test order
3. Change status to "Completed" or "Shipped"
4. Go to Stock Movements
5. ✅ Should see "Sale" movement (🛒)
6. ✅ Should see "Release" movement (🔓) for reservation
7. Go to Stock Management
8. ✅ Stock quantity reduced
9. ✅ Reserved quantity back to 0

#### C. Order Cancellation → Stock Release
1. Create another test order
2. Go to admin Orders
3. Cancel the order
4. Go to Stock Movements
5. ✅ Should see "Release" movement (🔓)
6. ✅ Quantity should be positive
7. Go to Stock Management
8. ✅ Reserved quantity reduced
9. ✅ Available quantity increased

---

### 6. Dashboard Metrics Verification

**Go back to**: `/inventory`

**Verify Calculations**:

#### A. Summary Cards
1. **Total Products**: Count all variants
2. **In Stock**: Count variants with stock > low_stock_threshold
3. **Low Stock**: Count variants with stock ≤ low_stock_threshold but > 0
4. **Out of Stock**: Count variants with stock = 0
5. **Active Alerts**: Count unresolved alerts
6. **Inventory Value**: Sum of (cost_price × stock_quantity)
7. **Retail Value**: Sum of (price × stock_quantity)
8. **Potential Profit**: Retail Value - Inventory Value

#### B. Quick Stats
1. **Stock Movements (24h)**: Count movements from last 24 hours
2. **Profit Margin**: (Potential Profit / Retail Value) × 100
3. **Stock Availability**: (In Stock / Total Products) × 100

#### C. Low Stock Table
1. Should show items with stock ≤ reorder_point
2. Should show current stock, reorder point, suggested quantity
3. "Restock" button should work

---

## API Testing (Optional - Using Postman/Thunder Client)

### 1. Get Inventory List
```
GET /api/inventory/
```
**Expected**: Array of variants with inventory data

### 2. Get Dashboard
```
GET /api/inventory/dashboard/
```
**Expected**: 
```json
{
  "summary": { ... },
  "low_stock_items": [ ... ]
}
```

### 3. Adjust Stock
```
POST /api/inventory/adjust/
Content-Type: application/json

{
  "variant_id": 1,
  "adjustment_type": "restock",
  "quantity": 100,
  "cost_price": 500,
  "notes": "API test restock"
}
```
**Expected**: Success response with updated stock

### 4. Get Movements
```
GET /api/inventory/movements/
```
**Expected**: Array of stock movements

### 5. Get Alerts
```
GET /api/inventory/alerts/
```
**Expected**: Array of stock alerts

### 6. Resolve Alert
```
POST /api/inventory/alerts/{alert_id}/resolve/
```
**Expected**: Success response

---

## Common Issues & Solutions

### Issue 1: "Failed to load inventory"
**Solution**: 
- Check backend server is running
- Check API endpoint: `http://localhost:8000/api/inventory/`
- Check browser console for errors
- Verify authentication token is valid

### Issue 2: Stock adjustment not working
**Solution**:
- Check variant_id is correct
- Check quantity is positive number
- Check adjustment_type is valid
- Check backend logs for errors

### Issue 3: Alerts not appearing
**Solution**:
- Check if stock is actually below threshold
- Check `low_stock_threshold` value in product variant
- Check `reorder_point` value
- Manually trigger alert check in Django shell:
  ```python
  from products.models import ProductVariant
  variant = ProductVariant.objects.get(id=1)
  variant.check_and_create_alerts()
  ```

### Issue 4: Movements not showing
**Solution**:
- Check if movements are being created
- Check Django admin: `/admin/inventory/stockmovement/`
- Verify API endpoint returns data
- Check date filters aren't excluding results

### Issue 5: Dashboard shows 0 for all metrics
**Solution**:
- Check if products have variants
- Check if variants have stock_quantity > 0
- Check if cost_price is set
- Verify database has data

---

## Success Criteria

✅ **All pages load without errors**
✅ **Stock adjustments work for all types**
✅ **Movements are logged correctly**
✅ **Alerts are generated automatically**
✅ **Alerts can be resolved**
✅ **Filters and search work**
✅ **Dashboard metrics are accurate**
✅ **Navigation between pages works**
✅ **Order integration works (if tested)**
✅ **No TypeScript errors**
✅ **No console errors**
✅ **Responsive design works on mobile**

---

## Performance Testing

### Load Testing
1. Create 100+ product variants
2. Create 1000+ stock movements
3. Check page load times
4. Check filter performance
5. Check search performance

### Expected Performance
- Dashboard: < 2 seconds
- Stock Management: < 3 seconds
- Movements: < 3 seconds
- Alerts: < 2 seconds
- Search/Filter: < 1 second

---

## Next Steps After Testing

1. ✅ Fix any bugs found
2. ✅ Optimize slow queries
3. ✅ Add loading states if needed
4. ✅ Add error handling
5. ✅ Add success notifications
6. ✅ Test on different screen sizes
7. ✅ Test with different user roles
8. ✅ Document any issues
9. ✅ Create user guide
10. ✅ Train staff on system

---

## Support

If you encounter any issues during testing:
1. Check browser console for errors
2. Check Django server logs
3. Check network tab for failed requests
4. Verify database has correct data
5. Try clearing browser cache
6. Try different browser
7. Check authentication status

**Happy Testing! 🎉**
