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
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-alpha/10 pb-6 mb-8 md:mb-12">
        <div>
          <span className="text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-alpha/50 mb-2 block">
            Curated Pairings
          </span>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-alpha tracking-tight">
            Frequently Bought Together
          </h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: Images Strip */}
        <div className="lg:col-span-7 flex items-center gap-3 md:gap-6 overflow-x-auto pb-4 md:pb-8 scrollbar-hide px-2">
          {/* Main Product */}
          <div className="flex-shrink-0 relative">
            <div className={`relative w-[45vw] md:w-[220px] rounded-xl overflow-hidden transition-all duration-500 bg-white ${selectedItems.main ? 'ring-2 ring-alpha ring-offset-4 ring-offset-creme shadow-lg' : 'opacity-50 grayscale-[30%] scale-95'}`} style={{ aspectRatio: '4/5' }}>
              <Image 
                src={mainVariant?.images?.[0]?.url || mainProduct.images?.[0]?.url || '/placeholder.jpg'} 
                alt={mainProduct.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] uppercase tracking-widest text-alpha font-medium">This Item</div>
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts.map((product, idx) => (
            <div key={product.id} className="flex items-center gap-3 md:gap-6 flex-shrink-0">
              <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full transition-colors duration-500 ${selectedItems[product.id] ? 'bg-alpha text-creme' : 'bg-alpha/5 text-alpha/30'}`}>
                <Plus className="w-4 h-4 md:w-4 md:h-4" />
              </div>
              <div className={`relative w-[45vw] md:w-[220px] rounded-xl overflow-hidden transition-all duration-500 bg-white ${selectedItems[product.id] ? 'ring-2 ring-alpha ring-offset-4 ring-offset-creme shadow-lg' : 'opacity-50 grayscale-[30%] scale-95'}`} style={{ aspectRatio: '4/5' }}>
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

        {/* Right: Actions & List */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Checklist */}
          <div className="space-y-6 mb-10">
            {/* Main Item Checkbox */}
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="pt-1">
                <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 ${selectedItems.main ? 'border-alpha bg-alpha text-creme shadow-sm scale-110' : 'border-alpha/30 bg-transparent group-hover:border-alpha/60'}`}>
                  {selectedItems.main && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-primary uppercase tracking-widest text-alpha/50 mb-0.5">This Item</p>
                <p className={`text-base md:text-lg font-secondary transition-colors ${selectedItems.main ? 'text-alpha' : 'text-alpha/60'}`}>
                  {mainProduct.name}
                </p>
                {selectedItems.main && getPrice(mainProduct, true) > 0 && (
                  <p className="text-sm font-primary text-alpha mt-1 font-medium">₹{getPrice(mainProduct, true).toLocaleString('en-IN')}</p>
                )}
              </div>
            </label>

            {/* Related Items Checkboxes */}
            {relatedProducts.map(product => (
              <label key={product.id} className="flex items-start gap-4 cursor-pointer group">
                <div className="pt-1">
                  <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 ${selectedItems[product.id] ? 'border-alpha bg-alpha text-creme shadow-sm scale-110' : 'border-alpha/30 bg-transparent group-hover:border-alpha/60'}`}>
                    {selectedItems[product.id] && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </div>
                </div>
                <div className="flex-1">
                  <Link href={`/product/${product.slug}`} className="block">
                    <p className={`text-base md:text-lg font-secondary transition-all hover:underline decoration-alpha/30 underline-offset-4 ${selectedItems[product.id] ? 'text-alpha' : 'text-alpha/60'}`}>
                      {product.name}
                    </p>
                  </Link>
                  {selectedItems[product.id] && getPrice(product, false) > 0 && (
                    <p className="text-sm font-primary text-alpha mt-1 font-medium">₹{getPrice(product, false).toLocaleString('en-IN')}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Total & CTA Card */}
          <div className="bg-white/50 backdrop-blur-md border border-alpha/10 p-6 md:p-8 rounded-2xl shadow-sm">
            <div className="flex justify-between items-end mb-6 border-b border-alpha/10 pb-6">
              <div>
                <p className="text-[10px] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-1">Bundle Total</p>
                {totalPrice > 0 ? (
                  <p className="text-3xl md:text-4xl font-secondary text-alpha">₹{totalPrice.toLocaleString('en-IN')}</p>
                ) : (
                  <p className="text-sm font-primary text-alpha/70 italic">Price on Quotation</p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-alpha/5 rounded text-xs font-primary uppercase tracking-widest text-alpha">
                  {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleBulkAdd}
              disabled={selectedCount === 0 || isAdding}
              className={`relative w-full overflow-hidden group py-4 px-6 md:py-5 rounded-full text-xs md:text-sm uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-3 ${
                addedSuccess 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-alpha text-creme hover:bg-alpha/90 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {!addedSuccess && !isAdding && (
                <span className="pointer-events-none absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
              
              {addedSuccess ? (
                <><Check className="w-5 h-5" /> Added to Cart</>
              ) : isAdding ? (
                <span className="animate-pulse">Adding Items...</span>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Add Bundle to Cart</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
