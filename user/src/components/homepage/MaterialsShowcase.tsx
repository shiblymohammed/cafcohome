"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ApiClient } from "@/src/lib/api/client";

interface Material {
  id: number;
  name: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

export default function MaterialsShowcase() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await ApiClient.getMaterials();
        let results = response.results || response;
        if (Array.isArray(results)) {
          results = results.filter((m: Material) => m.is_active);
          setMaterials(results);
        }
      } catch (error) {
        console.error("Network error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-12 md:py-20 bg-[#1c1c1c] min-h-[80vh] flex items-center justify-center">
         <div className="w-[95%] max-w-[1600px] h-[80vh] min-h-[600px] bg-white/5 rounded-[2rem] md:rounded-[3rem] animate-pulse"></div>
      </section>
    );
  }

  if (materials.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-20 bg-[#1c1c1c]">
      <div className="w-[95%] max-w-[1600px] mx-auto h-[80vh] min-h-[600px] lg:h-[85vh] bg-[#2a2a2a] rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-2xl group">
        
        {/* Full-bleed Background Images inside the card */}
        {materials.map((mat, idx) => (
          <div 
            key={mat.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {mat.image_url && (
              <Image 
                src={mat.image_url} 
                alt={mat.name}
                fill 
                sizes="100vw"
                priority={idx === 0}
                className={`object-cover transition-transform duration-[15000ms] ease-linear ${
                  activeIndex === idx ? 'scale-105' : 'scale-100'
                }`} 
              />
            )}
            
            {/* Gentle gradient to ensure text/UI visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
        ))}

        {/* Top Left Glass Panel (Specs Table) */}
        <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 w-full max-w-[280px] md:max-w-[420px]">
          <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <div className="relative h-[280px] md:h-[320px]">
               {materials.map((mat, idx) => (
                 <div 
                   key={mat.id}
                   className={`absolute inset-0 w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                     activeIndex === idx ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-8 pointer-events-none'
                   }`}
                 >
                    <div className="flex flex-col h-full">
                      <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 py-3 md:py-4 border-b border-alpha/10">
                        <span className="font-bold text-alpha text-[11px] md:text-sm">Material</span>
                        <span className="text-alpha/80 text-[11px] md:text-sm font-medium">{mat.name}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 py-3 md:py-4 border-b border-alpha/10">
                        <span className="font-bold text-alpha text-[11px] md:text-sm">Category</span>
                        <span className="text-alpha/80 text-[11px] md:text-sm font-medium">{mat.title || 'Premium'}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 py-3 md:py-4 border-b border-alpha/10">
                        <span className="font-bold text-alpha text-[11px] md:text-sm">Quality</span>
                        <span className="text-alpha/80 text-[11px] md:text-sm font-medium">Export Grade</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 py-3 md:py-4 border-b border-alpha/10">
                        <span className="font-bold text-alpha text-[11px] md:text-sm">Usage</span>
                        <span className="text-alpha/80 text-[11px] md:text-sm font-medium">Indoor / Decor</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-4 py-3 md:py-4">
                        <span className="font-bold text-alpha text-[11px] md:text-sm">Details</span>
                        <span className="text-alpha/80 text-[11px] md:text-sm leading-relaxed line-clamp-3 md:line-clamp-4">
                          {mat.description || "Premium material carefully selected for its durability and aesthetic excellence."}
                        </span>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Bottom Left Circular Selectors */}
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20 flex gap-3 md:gap-5">
          {materials.map((mat, idx) => (
            <button 
              key={mat.id}
              onClick={() => setActiveIndex(idx)}
              className={`w-14 h-14 md:w-[84px] md:h-[84px] rounded-full relative transition-all duration-300 ${
                activeIndex === idx 
                  ? 'p-1 md:p-1.5 border-[2px] md:border-[3px] border-white scale-100 shadow-2xl' 
                  : 'p-1 md:p-1.5 border-[2px] md:border-[3px] border-transparent opacity-60 hover:opacity-100 scale-95 grayscale-[30%] hover:grayscale-0'
              }`}
            >
              <div className="w-full h-full rounded-full relative overflow-hidden shadow-inner">
                {mat.image_url && (
                  <Image src={mat.image_url} fill className="object-cover" alt={mat.name} sizes="84px" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Right CTA (Pill + Circle) */}
        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 flex items-center gap-2 md:gap-3">
          <button className="bg-white text-alpha font-secondary font-bold text-[10px] md:text-sm uppercase tracking-widest px-6 md:px-8 py-3.5 md:py-4 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:bg-creme transition-colors">
            Explore Collection
          </button>
          <button className="bg-white text-alpha w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:bg-creme transition-transform hover:-rotate-45 duration-300">
            <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

      </div>
    </section>
  );
}
