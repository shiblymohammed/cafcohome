import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/src/contexts/CartContext";

interface FrequentlyBoughtTogetherProps {
  mainProduct: any;
  mainVariant: any;
  relatedProducts: any[];
}

export default function FrequentlyBoughtTogether({ mainProduct, mainVariant, relatedProducts }: FrequentlyBoughtTogetherProps) {
  const { addItem } = useCart();
  
  // Create cart-compatible main product
  const getCartProduct = (p: any, isMain: boolean) => {
    if (isMain) {
      return {
        ...p,
        colors: mainVariant ? [mainVariant.color] : [],
        materials: mainVariant ? [mainVariant.material] : [],
        images: mainVariant ? mainVariant.images : p.images || [],
        is_in_stock: mainVariant ? mainVariant.stock_quantity > 0 : p.is_in_stock,
        price: mainVariant ? mainVariant.price : p.price
      };
    }
    return p;
  };

  const getPrice = (p: any, isMain: boolean) => {
    if (isMain && mainVariant && mainVariant.price) {
      return parseFloat(mainVariant.price);
    }
    return p.price ? parseFloat(p.price) : 0;
  };

  // State to track which items are selected
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({
    main: true,
    ...Object.fromEntries(relatedProducts.map(p => [p.id, true]))
  });

  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const toggleItem = (id: string | number) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  
  const totalPrice = Object.entries(selectedItems).reduce((sum, [id, isSelected]) => {
    if (!isSelected) return sum;
    if (id === 'main') {
      return sum + getPrice(mainProduct, true);
    }
    const product = relatedProducts.find(p => p.id.toString() === id);
    if (product) {
      return sum + getPrice(product, false);
    }
    return sum;
  }, 0);

  const handleBulkAdd = () => {
    setIsAdding(true);
    
    // Add main product if selected
    if (selectedItems.main && mainProduct) {
      addItem(getCartProduct(mainProduct, true), 1);
    }
    
    // Add selected related products
    relatedProducts.forEach(product => {
      if (selectedItems[product.id]) {
        addItem(getCartProduct(product, false), 1);
      }
    });

    setTimeout(() => {
      setIsAdding(false);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }, 500);
  };

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="bg-white border border-alpha/10 rounded-2xl p-6 md:p-8 lg:p-10 shadow-sm">
      <h3 className="text-xl md:text-2xl font-secondary text-alpha mb-6 md:mb-8">Frequently Bought Together</h3>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center">
        {/* Images List */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-4 lg:pb-0 w-full lg:w-3/5">
          {/* Main Product */}
          <div className="flex-shrink-0 relative">
            <div className={`relative w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${selectedItems.main ? 'border-alpha' : 'border-transparent opacity-50'}`}>
              <Image 
                src={mainVariant?.images?.[0]?.url || mainProduct.images?.[0]?.url || '/placeholder.jpg'} 
                alt={mainProduct.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts.map((product, idx) => (
            <div key={product.id} className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-alpha/5 text-alpha/40">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className={`relative w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${selectedItems[product.id] ? 'border-alpha' : 'border-transparent opacity-50'}`}>
                <Image 
                  src={product.images?.[0]?.url || '/placeholder.jpg'} 
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action / Total Box */}
        <div className="w-full lg:w-2/5 flex flex-col items-start lg:border-l lg:border-alpha/10 lg:pl-10">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-sm font-primary text-alpha/60 uppercase tracking-wider">Total price:</span>
            <span className="text-2xl font-medium text-alpha font-secondary">₹{totalPrice.toLocaleString()}</span>
          </div>
          
          <button
            onClick={handleBulkAdd}
            disabled={selectedCount === 0 || isAdding}
            className={`w-full py-4 px-6 rounded-lg uppercase tracking-wider text-xs md:text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 mb-6 ${
              addedSuccess 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-alpha text-creme hover:bg-alpha/90 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {addedSuccess ? (
              <><Check className="w-5 h-5" /> Added to Cart</>
            ) : isAdding ? (
              <span className="animate-pulse">Adding...</span>
            ) : (
              <><ShoppingCart className="w-5 h-5" /> Add Selected to Cart</>
            )}
          </button>

          {/* Checklist */}
          <div className="space-y-4 w-full">
            {/* Main Item Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center pt-0.5">
                <input 
                  type="checkbox" 
                  checked={selectedItems.main} 
                  onChange={() => toggleItem('main')} 
                  className="w-5 h-5 border-2 border-alpha/30 rounded text-alpha focus:ring-alpha/20 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-alpha group-hover:text-alpha/80 transition-colors">
                  <span className="font-semibold text-alpha/60">This item:</span> {mainProduct.name}
                </p>
                <p className="text-xs text-alpha/60 font-primary mt-0.5">₹{getPrice(mainProduct, true).toLocaleString()}</p>
              </div>
            </label>

            {/* Related Items Checkboxes */}
            {relatedProducts.map(product => (
              <label key={product.id} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center pt-0.5">
                  <input 
                    type="checkbox" 
                    checked={selectedItems[product.id]} 
                    onChange={() => toggleItem(product.id)} 
                    className="w-5 h-5 border-2 border-alpha/30 rounded text-alpha focus:ring-alpha/20 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${product.slug}`} className="text-sm font-medium text-alpha hover:underline decoration-alpha/30 underline-offset-2 transition-all block">
                    {product.name}
                  </Link>
                  <p className="text-xs text-alpha/60 font-primary mt-0.5">₹{getPrice(product, false).toLocaleString()}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
