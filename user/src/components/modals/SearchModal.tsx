'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Clock, X, TrendingUp, ArrowRight, Tag, ChevronRight } from 'lucide-react';
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

const TRENDING_SEARCHES = ['Sofa', 'Dining Table', 'Bed Frame', 'Office Chair', 'Bookshelf'];

export default function SearchModal({
  isOpen,
  onClose,
  triggerRef,
  query,
  setQuery,
}: SearchModalProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* ── Detect mobile ─────────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Measure trigger element for anchoring ─────────────── */
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const measure = () => {
      if (triggerRef?.current) {
        const r = triggerRef.current.getBoundingClientRect();
        setRect({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 360) });
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen, isMobile, triggerRef]);

  /* ── Load recent searches + focus ──────────────────────── */
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('dravo_recentSearches');
      if (saved) setRecentSearches(JSON.parse(saved));
      setActiveIndex(-1);
      if (isMobile) setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      setResults([]);
    }
  }, [isOpen, isMobile]);

  /* ── Close on outside click ─────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen, onClose, triggerRef]);

  /* ── Debounced search ──────────────────────────────────── */
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }
    setIsLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await ApiClient.getProducts({
          search: query.trim(),
          is_active: 'true',
          page_size: '6',
        });
        setResults(response.results || []);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  /* ── Keyboard nav ──────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const total = results.length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => {
          const next = i < total - 1 ? i + 1 : 0;
          itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => {
          const prev = i > 0 ? i - 1 : total - 1;
          itemRefs.current[prev]?.scrollIntoView({ block: 'nearest' });
          return prev;
        });
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && results[activeIndex]) {
          handleProductClick(results[activeIndex]);
        } else if (query.trim().length >= 2) {
          handleViewAll();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [results, activeIndex, query],
  );

  /* ── Helpers ───────────────────────────────────────────── */
  const saveRecentSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const updated = [t, ...recentSearches.filter(s => s !== t)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('dravo_recentSearches', JSON.stringify(updated));
  };

  const handleProductClick = (product: SearchResult) => {
    saveRecentSearch(query);
    onClose();
    router.push(`/product/${product.slug}`);
  };

  const handleViewAll = () => {
    if (!query.trim()) return;
    saveRecentSearch(query);
    onClose();
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleTermClick = (term: string) => {
    setQuery(term);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* ── Guards ────────────────────────────────────────────── */
  if (!isOpen) return null;

  const hasQuery = query.trim().length >= 2;
  const hasResults = results.length > 0;
  const showRecent = !hasQuery && recentSearches.length > 0;
  const showTrending = !hasQuery;

  /* ── Desktop dropdown style (anchored to trigger) ─────── */
  const dropdownStyle: React.CSSProperties = isMobile
    ? { top: '48px', left: 0, right: 0, width: '100%' }
    : rect
    ? { top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px` }
    : { display: 'none' };

  return (
    <>
      {/* ── Backdrop ── only below the navbar, no blur on the nav itself */}
      <div
        className="fixed z-[89] bg-alpha/[0.06]"
        style={{ top: isMobile ? '48px' : '96px', left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
        aria-hidden
      />

      {/* ── Dropdown panel ── */}
      <div
        ref={modalRef}
        role="dialog"
        aria-label="Search results"
        className="fixed z-[101] bg-white flex flex-col overflow-hidden"
        style={{
          ...dropdownStyle,
          maxHeight: isMobile ? 'calc(100vh - 48px)' : '68vh',
          boxShadow: '0 8px 40px rgba(38,37,36,0.14), 0 2px 8px rgba(38,37,36,0.06)',
          border: '1px solid rgba(38,37,36,0.07)',
          borderTop: 'none',
          animation: 'searchSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ── Mobile search input ── */}
        {isMobile && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-alpha/10 bg-white flex-shrink-0">
            <Search className="text-alpha/40 flex-shrink-0" size={17} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, categories..."
              className="flex-1 bg-transparent text-[14px] font-primary text-alpha placeholder:text-alpha/35 outline-none"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-alpha/30 hover:text-alpha transition-colors"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Empty state — trending / recent */}
          {!hasQuery && (
            <div className="p-4">
              {showRecent && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-primary uppercase tracking-[0.18em] text-alpha/45">
                      <Clock size={10} /> Recent
                    </span>
                    <button
                      onClick={() => { setRecentSearches([]); localStorage.removeItem('dravo_recentSearches'); }}
                      className="text-[10px] font-primary text-alpha/30 hover:text-alpha transition-colors uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleTermClick(s)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-primary text-alpha/60 bg-alpha/5 hover:bg-alpha/8 border border-alpha/8 hover:border-alpha/15 rounded-full transition-all duration-150"
                      >
                        <Clock size={10} className="text-alpha/25" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showTrending && (
                <div>
                  <span className="flex items-center gap-1.5 text-[10px] font-primary uppercase tracking-[0.18em] text-alpha/45 mb-2">
                    <TrendingUp size={10} /> Trending
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_SEARCHES.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleTermClick(s)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-primary text-alpha/60 hover:text-tango bg-transparent hover:bg-tango/5 border border-alpha/10 hover:border-tango/20 rounded-full transition-all duration-150"
                      >
                        <Tag size={9} className="text-tango/40" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading && hasQuery && (
            <div className="flex flex-col items-center justify-center py-8 gap-2.5">
              <div className="w-6 h-6 rounded-full border-2 border-alpha/10 border-t-tango animate-spin" />
              <p className="text-[11px] font-primary text-alpha/35 tracking-wide">Searching…</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && hasQuery && hasResults && (
            <div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-alpha/6 bg-alpha/[0.015]">
                <p className="text-[10px] font-primary uppercase tracking-[0.16em] text-alpha/40">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.length >= 6 && (
                  <button
                    onClick={handleViewAll}
                    className="flex items-center gap-1 text-[10px] font-primary text-tango/70 hover:text-tango uppercase tracking-wider transition-colors"
                  >
                    View all <ArrowRight size={10} />
                  </button>
                )}
              </div>

              <div className="divide-y divide-alpha/5">
                {results.map((product, idx) => (
                  <button
                    key={product.id}
                    ref={el => { itemRefs.current[idx] = el; }}
                    onClick={() => handleProductClick(product)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left group transition-colors duration-100 ${
                      activeIndex === idx ? 'bg-alpha/[0.04]' : 'hover:bg-alpha/[0.03]'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 flex-shrink-0 bg-alpha/5 overflow-hidden rounded">
                      {product.main_image ? (
                        <Image
                          src={product.main_image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="text-alpha/15" size={16} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-[13px] font-secondary truncate transition-colors ${
                          activeIndex === idx ? 'text-tango' : 'text-alpha group-hover:text-tango'
                        }`}
                      >
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {product.category_name && (
                          <span className="text-[10px] font-primary text-alpha/40 bg-alpha/5 px-1.5 py-0.5 rounded leading-none">
                            {product.category_name}
                          </span>
                        )}
                        {product.subcategory_name && (
                          <span className="text-[10px] font-primary text-alpha/35">
                            · {product.subcategory_name}
                          </span>
                        )}
                        {/* Price Display */}
                        {(() => {
                          const selling = Number(product.selling_price || 0);
                          const mrp = Number(product.mrp || 0);
                          const hasOffer = mrp > selling && selling > 0;
                          const discountPct = hasOffer ? Math.round(((mrp - selling) / mrp) * 100) : 0;
                          
                          return (
                            <div className="ml-auto flex items-baseline gap-1.5 flex-wrap pl-2">
                              <span className={`text-[11px] font-primary font-bold ${hasOffer ? 'text-gold' : 'text-alpha'}`}>
                                ₹{selling.toLocaleString("en-IN")}
                              </span>
                              {hasOffer && (
                                <>
                                  <span className="text-[9px] font-primary text-alpha/40 line-through">
                                    ₹{mrp.toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-[8px] font-primary text-red-600 bg-red-50 border border-red-100 px-1 py-0.5 rounded-sm">
                                    {discountPct}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Status + Arrow */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!product.is_in_stock && (
                        <span className="text-[9px] font-primary text-red-400 px-1.5 py-0.5 bg-red-50 border border-red-100 rounded">
                          Out of stock
                        </span>
                      )}
                      <ChevronRight
                        size={13}
                        className={`transition-all duration-150 ${
                          activeIndex === idx
                            ? 'text-tango translate-x-0.5'
                            : 'text-alpha/12 group-hover:text-tango/40 group-hover:translate-x-0.5'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!isLoading && hasQuery && !hasResults && (
            <div className="flex flex-col items-center justify-center py-10 px-6">
              <div className="w-10 h-10 rounded-full bg-alpha/5 flex items-center justify-center mb-3">
                <Search className="text-alpha/20" size={18} />
              </div>
              <h3 className="text-[13px] font-secondary text-alpha mb-1">No products found</h3>
              <p className="text-[11px] font-primary text-alpha/40 text-center">
                Try a different keyword
              </p>
              <button
                onClick={() => { onClose(); router.push('/products'); }}
                className="mt-4 px-4 py-1.5 text-[10px] font-primary text-alpha/60 hover:text-alpha border border-alpha/12 hover:border-alpha/25 rounded-full transition-all uppercase tracking-wider"
              >
                Browse All Products
              </button>
            </div>
          )}
        </div>

        {/* ── Footer CTA ── */}
        {!isLoading && hasQuery && hasResults && (
          <div className="flex-shrink-0 border-t border-alpha/8">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-primary uppercase tracking-[0.14em] text-alpha/40 hover:text-alpha hover:bg-alpha/4 transition-all group"
            >
              View all results for
              <span className="text-tango font-medium normal-case tracking-normal text-[11px]">"{query}"</span>
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* ── Keyboard hints ── */}
        {!isMobile && hasQuery && hasResults && (
          <div className="flex-shrink-0 border-t border-alpha/6 bg-alpha/[0.01] px-4 py-1.5 flex items-center gap-4">
            {[['↑↓', 'navigate'], ['↵', 'select'], ['Esc', 'close']].map(([k, label]) => (
              <span key={k} className="text-[9px] font-primary text-alpha/20 flex items-center gap-1">
                <kbd className="px-1 py-0.5 border border-alpha/10 rounded text-[8px]">{k}</kbd>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes searchSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
