"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  colors: Array<{ name: string; hex: string }>;
  materials: string[];
  price?: string | number;
  mrp?: string | number;
  category: number;
  category_name: string;
  category_slug: string;
  subcategory: number;
  subcategory_name: string;
  subcategory_slug: string;
  brand: number | null;
  brand_name: string | null;
  brand_slug: string | null;
  images: Array<{
    url: string;
    alt?: string;
    order?: number;
  }>;
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_in_stock: boolean;
  average_rating?: number;
  review_count?: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: number;  // Add variant ID
  variantSku?: string;  // Add variant SKU
  variantPrice?: number;  // Add variant price
  variantMrp?: number;  // Add variant MRP
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addItem: (product: Product, quantity?: number, variantInfo?: { id: number; sku: string; price: number; mrp: number }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "dravo_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [items, isInitialized]);

  const addItem = (product: Product, quantity: number = 1, variantInfo?: { id: number; sku: string; price: number; mrp: number }) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id,
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          // Update variant info if provided
          ...(variantInfo && {
            variantId: variantInfo.id,
            variantSku: variantInfo.sku,
            variantPrice: variantInfo.price,
            variantMrp: variantInfo.mrp,
          }),
        };
        return newItems;
      }

      // Add new item
      return [...prevItems, { 
        product, 
        quantity,
        ...(variantInfo && {
          variantId: variantInfo.id,
          variantSku: variantInfo.sku,
          variantPrice: variantInfo.price,
          variantMrp: variantInfo.mrp,
        }),
      }];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId),
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: number): number => {
    const item = items.find((item) => item.product.id === productId);
    return item?.quantity || 0;
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const value: CartContextType = {
    items,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
