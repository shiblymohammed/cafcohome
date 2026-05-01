"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ApiClient } from "@/src/lib/api/client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface Collection {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  tags: string;
  image_url: string;
}

// Sub-component for Desktop Accordion Card with Parallax
const DesktopCollectionCard = ({ 
  collection, 
  index, 
  isActive, 
  onMouseEnter,
  scrollYProgress
}: { 
  collection: Collection, 
  index: number, 
  isActive: boolean, 
  onMouseEnter: () => void,
  scrollYProgress: MotionValue<number>
}) => {
  // Match the dramatic ["-30%", "30%"] parallax speed from Categories
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  return (
    <div
      onMouseEnter={onMouseEnter}
      className={`relative overflow-hidden rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group ${
        isActive ? "flex-[3]" : "flex-[1]"
      }`}
    >
      <Link href={`/collections/${collection.slug}`} className="absolute inset-0 block w-full h-full overflow-hidden">
        
        <motion.div 
          style={{ y }} 
          className="absolute inset-x-0 w-full h-[160%] top-[-30%]"
        >
          <Image
            src={collection.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200'}
            alt={collection.name}
            fill
            className={`object-cover transition-transform duration-1000 ease-out ${
              isActive ? "scale-105" : "scale-100 grayscale-[30%]"
            }`}
            sizes={isActive ? "50vw" : "20vw"}
          />
        </motion.div>
        
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            isActive 
              ? "bg-gradient-to-t from-alpha/90 via-alpha/10 to-transparent opacity-90" 
              : "bg-alpha/30"
          }`}
        />
        
        <div className={`absolute inset-0 flex flex-col justify-end p-8 transition-all duration-700 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {collection.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {collection.tags.split(',').slice(0, 2).map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-semibold rounded-full border border-white/20">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          <h3 className="text-3xl lg:text-5xl font-secondary text-white mb-3 leading-tight drop-shadow-sm">
            {collection.name}
          </h3>
          <div className="overflow-hidden">
            <p className={`text-white/80 font-primary text-sm lg:text-base max-w-md line-clamp-2 transition-all duration-700 delay-100 ${
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              {collection.subtitle || "Explore this premium collection crafted for perfection."}
            </p>
          </div>
          
          <div className="mt-6 flex items-center gap-3 text-white text-xs lg:text-sm font-primary font-bold uppercase tracking-widest">
            <span className="relative overflow-hidden group/btn">
              <span className="inline-block transition-transform duration-300 group-hover/btn:-translate-y-full">View Collection</span>
              <span className="absolute left-0 top-0 inline-block transition-transform duration-300 translate-y-full group-hover/btn:translate-y-0">View Collection</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 delay-100 ${
          isActive ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}>
          <h3 className="text-white font-secondary text-2xl lg:text-3xl whitespace-nowrap -rotate-90 tracking-wide drop-shadow-md">
            {collection.name}
          </h3>
        </div>
      </Link>
    </div>
  );
};

// Sub-component for Mobile Card with Parallax
const MobileCollectionCard = ({ 
  collection, 
  index, 
  scrollYProgress 
}: { 
  collection: Collection, 
  index: number, 
  scrollYProgress: MotionValue<number> 
}) => {
  // Match the dramatic ["-30%", "30%"] parallax speed from Categories
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  return (
    <Link 
      href={`/collections/${collection.slug}`}
      className={`relative overflow-hidden rounded-3xl block w-full group ${
        index === 0 ? "h-[400px]" : "h-[250px]"
      }`}
    >
      <motion.div style={{ y }} className="absolute inset-x-0 w-full h-[160%] top-[-30%]">
        <Image
          src={collection.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200'}
          alt={collection.name}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          sizes="95vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-alpha/90 via-alpha/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        {collection.tags && index === 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {collection.tags.split(',').slice(0, 1).map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] uppercase tracking-widest font-bold rounded-full">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        <h3 className={`font-secondary text-white leading-tight ${
          index === 0 ? "text-3xl mb-2" : "text-2xl mb-1"
        }`}>
          {collection.name}
        </h3>
        {collection.subtitle && index === 0 && (
          <p className="text-white/70 font-primary text-xs line-clamp-2 mb-4">
            {collection.subtitle}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-white text-[10px] font-primary font-bold uppercase tracking-widest mt-2">
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
};

// Extracted inner component to ensure useScroll is only called when ref is definitely rendered
const CollectionsSlider = ({ collections }: { collections: Collection[] }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-16 md:py-24 bg-white border-t border-black/5">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        
        {/* Header - Centered & Elegant */}
        <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-16">
          <span className="text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-alpha/50 mb-3 block font-bold">
            Curated For You
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-secondary text-alpha tracking-tight">
            Exclusive Collections
          </h2>
          <p className="text-alpha/60 font-primary text-sm md:text-base mt-4 max-w-lg">
            Discover our handpicked selections designed to elevate your living spaces with uncompromising luxury and style.
          </p>
        </div>

        {/* Desktop Interactive Accordion Layout */}
        <div className="hidden md:flex w-full h-[500px] lg:h-[650px] gap-4">
          {collections.map((collection, index) => {
            const isActive = activeId === collection.id || (activeId === null && index === 0);
            return (
              <DesktopCollectionCard 
                key={collection.id}
                collection={collection}
                index={index}
                isActive={isActive}
                onMouseEnter={() => setActiveId(collection.id)}
                scrollYProgress={scrollYProgress}
              />
            );
          })}
        </div>

        {/* Mobile Vertical Bento Layout */}
        <div className="md:hidden flex flex-col gap-4">
          {collections.map((collection, index) => (
            <MobileCollectionCard
              key={collection.id}
              collection={collection}
              index={index}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default function CollectionsSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await ApiClient.getCollections();
        const data = response.results || response;
        if (Array.isArray(data)) {
          setCollections(data.slice(0, 5)); // Limit to 5 for optimal accordion look
        }
      } catch (error) {
        console.error("Failed to load collections:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-ivory border-t border-black/5">
        <div className="max-w-[1920px] mx-auto px-4 md:px-12">
          <div className="h-4 w-32 bg-black/5 rounded animate-pulse mb-8" />
          <div className="flex flex-col md:flex-row gap-4 h-[600px]">
             <div className="flex-1 bg-black/5 rounded-3xl animate-pulse" />
             <div className="flex-[2] bg-black/5 rounded-3xl animate-pulse hidden md:block" />
             <div className="flex-1 bg-black/5 rounded-3xl animate-pulse hidden md:block" />
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) return null;

  return <CollectionsSlider collections={collections} />;
}
