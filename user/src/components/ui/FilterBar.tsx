"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  sortOptions?: FilterOption[];
  colors?: string[];
  materials?: string[];
  brands?: string[];
  onSortChange?: (value: string) => void;
  onColorChange?: (colors: string[]) => void;
  onMaterialChange?: (materials: string[]) => void;
  onBrandChange?: (brands: string[]) => void;
  onClearFilters?: () => void;
  activeFiltersCount?: number;
}

const defaultSortOptions: FilterOption[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Best Selling", value: "best-selling" },
];

export function FilterBar({
  sortOptions = defaultSortOptions,
  colors = [],
  materials = [],
  brands = [],
  onSortChange,
  onColorChange,
  onMaterialChange,
  onBrandChange,
  onClearFilters,
  activeFiltersCount = 0,
}: FilterBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState("featured");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const lastScrollY = useRef(0);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Handle scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      
      // Only trigger visibility change after scrolling more than 10px
      if (Math.abs(scrollDelta) > 10) {
        if (scrollDelta > 0 && currentScrollY > 100) {
          // Scrolling down
          setIsVisible(false);
          setIsExpanded(false);
          setActiveDropdown(null);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange?.(value);
    setActiveDropdown(null);
  };

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onColorChange?.(newColors);
  };

  const toggleMaterial = (material: string) => {
    const newMaterials = selectedMaterials.includes(material)
      ? selectedMaterials.filter(m => m !== material)
      : [...selectedMaterials, material];
    setSelectedMaterials(newMaterials);
    onMaterialChange?.(newMaterials);
  };

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    onBrandChange?.(newBrands);
  };

  const clearAllFilters = () => {
    setSelectedSort("featured");
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedBrands([]);
    onClearFilters?.();
  };

  const totalActiveFilters = 
    (selectedSort !== "featured" ? 1 : 0) +
    selectedColors.length +
    selectedMaterials.length +
    selectedBrands.length;

  return (
    <div
      ref={filterBarRef}
      className={`fixed bottom-0 left-0 right-0 z-sticky lg:hidden transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Expanded Filter Panel */}
      <div
        className={`bg-creme border-t border-alpha/10 overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Sort */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-alpha/60 mb-3 font-primary">Sort By</h4>
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`block w-full text-left text-sm font-primary py-1 transition-colors ${
                      selectedSort === option.value ? "text-alpha font-medium" : "text-alpha/60 hover:text-alpha"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-alpha/60 mb-3 font-primary">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1.5 text-xs font-primary border transition-colors ${
                        selectedColors.includes(color)
                          ? "bg-alpha text-creme border-alpha"
                          : "bg-transparent text-alpha/70 border-alpha/20 hover:border-alpha"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {materials.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-alpha/60 mb-3 font-primary">Material</h4>
                <div className="flex flex-wrap gap-2">
                  {materials.map(material => (
                    <button
                      key={material}
                      onClick={() => toggleMaterial(material)}
                      className={`px-3 py-1.5 text-xs font-primary border transition-colors ${
                        selectedMaterials.includes(material)
                          ? "bg-alpha text-creme border-alpha"
                          : "bg-transparent text-alpha/70 border-alpha/20 hover:border-alpha"
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-alpha/60 mb-3 font-primary">Brand</h4>
                <div className="flex flex-wrap gap-2">
                  {brands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-1.5 text-xs font-primary border transition-colors ${
                        selectedBrands.includes(brand)
                          ? "bg-alpha text-creme border-alpha"
                          : "bg-transparent text-alpha/70 border-alpha/20 hover:border-alpha"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="bg-alpha text-creme">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: Filter Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-primary hover:text-creme/80 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {totalActiveFilters > 0 && (
                <span className="w-5 h-5 bg-tango text-creme text-[10px] rounded-full flex items-center justify-center">
                  {totalActiveFilters}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            {/* Center: Quick Filters (Desktop) */}
            <div className="hidden md:flex items-center gap-6">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-primary hover:text-creme/80 transition-colors"
                >
                  <span>Sort: {sortOptions.find(o => o.value === selectedSort)?.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === "sort" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "sort" && (
                  <div className="absolute bottom-full left-0 mb-2 bg-creme text-alpha shadow-dropdown min-w-[180px] py-2">
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`block w-full text-left px-4 py-2 text-xs font-primary hover:bg-alpha/5 transition-colors ${
                          selectedSort === option.value ? "font-medium" : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Clear Filters */}
            {totalActiveFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-primary hover:text-creme/80 transition-colors"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
