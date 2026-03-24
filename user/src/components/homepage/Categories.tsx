"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ApiClient, ApiClientError } from "@/src/lib/api/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Category {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

function ParallaxCategoryCard({ category, isMobile = false }: { category: Category, isMobile?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Directly tie parallax to raw scroll (no spring lag) to make it feel like 
  // the image is genuinely staying still while the window scrolls over it.
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  if (isMobile) {
    return (
      <Link 
        ref={ref}
        href={`/categories/${category.slug}`} 
        className="relative w-full h-[60vw] max-h-[320px] overflow-hidden group border-b border-white/10 block bg-alpha"
      >
        <motion.div style={{ y }} className="absolute inset-x-0 w-full h-[160%] -top-[30%]">
           <Image 
             src={category.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800'} 
             alt={category.name}
             fill 
             sizes="100vw"
             className="object-cover transition-transform duration-700 group-hover:scale-105" 
           />
        </motion.div>
        <div className="absolute inset-0 bg-alpha/50 group-hover:bg-alpha/60 transition-colors duration-500" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
           <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-tango mb-3">
             {category.product_count} Products
           </span>
           <h3 className="text-3xl md:text-4xl font-secondary text-creme mb-4">{category.name}</h3>
           <div className="inline-flex items-center gap-2 text-[10px] font-primary uppercase tracking-widest text-creme/90 border-b border-creme/30 pb-1">
              Explore <ArrowRight className="w-3 h-3" />
           </div>
        </div>
      </Link>
    );
  }

  // Desktop Accordion Item
  return (
    <Link 
      ref={ref}
      href={`/categories/${category.slug}`}
      className="relative flex-1 hover:flex-[2.5] lg:hover:flex-[3] group transition-all duration-[900ms] ease-in-out cursor-pointer overflow-hidden border-r border-white/10 last:border-0 h-full block"
    >
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={category.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200'}
          alt={category.name}
          fill
          sizes="33vw"
          className="object-cover scale-110 lg:scale-125 group-hover:scale-100 transition-transform duration-[1200ms] ease-out"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-alpha via-alpha/60 to-transparent opacity-90 group-hover:opacity-40 transition-opacity duration-700" />
      
      {/* Vertical text state (default) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none mt-20">
        <h3 className="text-2xl xl:text-3xl font-secondary text-creme tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 drop-shadow-lg">
          {category.name}
        </h3>
      </div>

      {/* Horizontal text state (hover) */}
      <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 flex flex-col justify-end pointer-events-none">
         <span className="text-[10px] lg:text-xs font-primary uppercase tracking-[0.3em] text-tango mb-3 block">
           {category.product_count} Products
         </span>
         <h3 className="text-3xl lg:text-5xl xl:text-6xl font-secondary text-creme whitespace-normal mb-6 drop-shadow-2xl font-light">
           {category.name}
         </h3>
         <div className="flex items-center gap-3 text-creme opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 translate-y-4 group-hover:translate-y-0">
            <span className="text-xs font-primary uppercase tracking-widest">Explore</span>
            <div className="p-2 rounded-full border border-creme/30 bg-white/5 backdrop-blur-sm">
               <ArrowRight className="w-4 h-4" />
            </div>
         </div>
      </div>
    </Link>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await ApiClient.getCategories();
        const data = (response as any).results || response;
        const categoriesArray = Array.isArray(data) ? data : [];
        
        // Filter only featured and active categories
        const featuredCategories = categoriesArray
          .filter(c => c.is_featured && c.is_active)
          .sort((a, b) => a.display_order - b.display_order);
        
        setCategories(featuredCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        if (error instanceof ApiClientError) {
          console.error('API Error:', error.error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="h-screen w-full bg-alpha/5 animate-pulse flex items-center justify-center">
         <div className="text-alpha/40 font-primary uppercase tracking-widest text-sm">
            Curating Spaces...
         </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
       <section className="h-screen w-full bg-creme flex flex-col items-center justify-center">
        <div className="w-16 h-16 mx-auto mb-6 text-alpha/20">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="8" width="48" height="48" rx="4" />
            <path d="M8 24h48M8 40h48" />
            <path d="M24 8v48M40 8v48" />
          </svg>
        </div>
        <h3 className="text-3xl font-secondary text-alpha mb-4">Categories Coming Soon</h3>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors"
        >
          Browse All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    );
  }

  const displayCategories = categories.slice(0, 6);

  return (
    <section className="relative w-full bg-alpha overflow-hidden">
      
      {/* Floating Header Desktop */}
      <div className="absolute top-12 md:top-24 left-6 md:left-12 z-20 pointer-events-none hidden md:block mix-blend-difference">
         <p className="text-xs font-primary uppercase tracking-[0.3em] text-white/60 mb-2">Curated Spaces</p>
         <h2 className="text-4xl md:text-5xl font-secondary text-white border-l-2 border-tango pl-4">Shop by Category</h2>
      </div>

      {/* Desktop view: flex row accordion (Full Screen) */}
      <div className="hidden md:flex h-screen w-full">
        {displayCategories.map((category) => (
          <ParallaxCategoryCard key={category.id} category={category} isMobile={false} />
        ))}
      </div>

      {/* Mobile view: Stacked Image Tiles */}
      <div className="flex md:hidden flex-col w-full bg-creme">
         <div className="px-6 py-12 text-center border-b border-alpha/10">
            <p className="text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/60 mb-2">Curated Spaces</p>
            <h2 className="text-3xl font-secondary text-alpha">Shop by Category</h2>
         </div>
         <div className="flex flex-col w-full bg-alpha">
            {displayCategories.map((category) => (
              <ParallaxCategoryCard key={category.id} category={category} isMobile={true} />
            ))}
         </div>
      </div>

    </section>
  );
}
