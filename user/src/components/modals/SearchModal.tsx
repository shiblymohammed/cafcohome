'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Clock, X } from 'lucide-react';
import { ApiClient } from '@/src/lib/api/client';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
  query: string;
  setQuery: (query: string) => void;
}

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  category_name?: string;
  subcategory_name?: string;
  brand_name?: string;
  selling_price: string;
  mrp: string;
  main_image?: string;
  is_in_stock: boolean;
}

export default function SearchModal({ isOpen, onClose, triggerRef, query, setQuery }: SearchModalProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate position based on trigger button
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      if (isMobile) {
        // Mobile: Full width dropdown from top
        setPosition({
          top: rect.bottom + 4,
          left: 16, // 1rem padding
          width: window.innerWidth - 32, // Full width minus padding
        });
      } else {
        // Desktop: Positioned below button
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }
  }, [isOpen, triggerRef, isMobile]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
      // Focus input on mobile
      if (isMobile) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      // Clear results when modal closes
      setResults([]);
    }
  }, [isOpen, isMobile]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await ApiClient.getProducts({
          search: query.trim(),
          is_active: 'true',
          page_size: '8',
        });
        
        setResults(response.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const saveRecentSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleProductClick = (product: SearchResult) => {
    saveRecentSearch(query);
    onClose();
    router.push(`/product/${product.slug}`);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  // Only show results dropdown if there's content to show
  const showDropdown = query.trim().length >= 2 || recentSearches.length > 0 || isMobile;

  if (!showDropdown) return null;

  return (
    <>
      {/* Backdrop - subtle */}
      <div 
        className="fixed inset-0 z-[90] bg-alpha/5"
        onClick={onClose}
      />

      {/* Dropdown Results - positioned below search input */}
      <div
        ref={modalRef}
        className="fixed z-[100] bg-white shadow-2xl border border-alpha/10 max-h-[70vh] flex flex-col"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          minWidth: '300px',
          maxWidth: 'calc(100vw - 2rem)',
        }}
      >
        {/* Mobile Search Input */}
        {isMobile && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-alpha/10 bg-white">
            <Search className="text-alpha/40 flex-shrink-0" size={18} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 bg-transparent text-sm font-primary text-alpha placeholder:text-alpha/40 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-alpha/40 hover:text-alpha transition-colors"
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Show recent searches when no query */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-primary uppercase tracking-[0.2em] text-alpha/60 flex items-center gap-2">
                  <Clock size={12} />
                  Recent Searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-[10px] font-primary text-alpha/40 hover:text-alpha transition-colors uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left px-3 py-2 text-xs font-primary text-alpha/70 hover:bg-alpha/5 transition-colors flex items-center gap-2 rounded"
                  >
                    <Clock size={12} className="text-alpha/30" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && query.trim().length >= 2 && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-alpha/20 border-t-alpha mb-3" />
              <p className="text-xs font-primary text-alpha/60">Searching...</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && query.trim().length >= 2 && results.length > 0 && (
            <div className="p-3">
              <p className="text-[10px] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3 px-2">
                {results.length} {results.length === 1 ? 'Result' : 'Results'}
              </p>
              <div className="space-y-1">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-alpha/5 transition-colors text-left group rounded"
                  >
                    {/* Product Image */}
                    <div className="relative w-14 h-14 flex-shrink-0 bg-alpha/5 overflow-hidden">
                      {product.main_image ? (
                        <Image
                          src={product.main_image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="text-alpha/20" size={20} />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-secondary text-alpha group-hover:text-tango transition-colors truncate">
                        {product.name}
                      </h4>
                      <p className="text-[10px] font-primary text-alpha/50 mt-0.5 truncate">
                        {product.category_name}
                        {product.subcategory_name && ` • ${product.subcategory_name}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-primary text-alpha">
                          ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
                        </span>
                        {product.mrp !== product.selling_price && (
                          <span className="text-[10px] font-primary text-alpha/40 line-through">
                            ₹{parseFloat(product.mrp).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    {!product.is_in_stock && (
                      <span className="text-[9px] font-primary text-red-600 px-2 py-1 bg-red-50 border border-red-200 rounded">
                        Out of Stock
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.trim().length >= 2 && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="mx-auto text-alpha/20 mb-3" size={36} />
              <h3 className="text-sm font-secondary text-alpha mb-1">No products found</h3>
              <p className="text-xs font-primary text-alpha/60">
                Try searching with different keywords
              </p>
            </div>
          )}

          {/* Empty State - Mobile only */}
          {isMobile && !query.trim() && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <Search className="mx-auto text-alpha/20 mb-3" size={36} />
              <h3 className="text-sm font-secondary text-alpha mb-1">Start searching</h3>
              <p className="text-xs font-primary text-alpha/60">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
