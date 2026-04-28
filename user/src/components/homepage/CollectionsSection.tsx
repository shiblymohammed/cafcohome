"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ApiClient } from "@/src/lib/api/client";

interface Collection {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  tags: string;
  image_url: string;
}

export default function CollectionsSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await ApiClient.getCollections();
        const data = response.results || response;
        if (Array.isArray(data)) {
          setCollections(data);
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
      <section className="py-16 md:py-24 bg-white border-t border-alpha/5">
        <div className="max-w-[2400px] mx-auto px-4 md:px-8 xl:px-16 2xl:px-24">
          <div className="h-8 w-48 bg-black/5 rounded animate-pulse mb-12" />
          <div className="flex gap-6 overflow-hidden">
             <div className="w-[80vw] md:w-[60vw] h-[400px] bg-black/5 rounded-3xl animate-pulse shrink-0" />
             <div className="w-[80vw] md:w-[60vw] h-[400px] bg-black/5 rounded-3xl animate-pulse shrink-0" />
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return null; // Hide section if no collections
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24 xl:py-32 bg-white">
      <div className="w-full max-w-[2400px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="px-4 md:px-8 xl:px-16 2xl:px-24 mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-4 text-xs md:text-sm font-primary uppercase tracking-[0.3em] text-gold font-bold mb-4">
              <span className="w-8 h-[2px] bg-gold" />
              Curated Collections
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-inter font-black tracking-tighter text-alpha leading-[1.1] uppercase">
              Exclusive <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-alpha/80 to-alpha/40">Editions</span>
            </h2>
          </div>
          
          {/* Custom Navigation */}
          <div className="flex items-center gap-3 hidden md:flex">
            <button className="col-prev w-12 h-12 rounded-full border border-alpha/10 flex items-center justify-center hover:bg-alpha hover:text-white transition-colors duration-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="col-next w-12 h-12 rounded-full border border-alpha/10 flex items-center justify-center hover:bg-alpha hover:text-white transition-colors duration-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="w-full pl-4 md:pl-8 xl:pl-16 2xl:pl-24 pr-4">
          <Swiper
            modules={[FreeMode, Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.1}
            speed={800}
            navigation={{
              nextEl: '.col-next',
              prevEl: '.col-prev',
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: true,
            }}
            freeMode={{ enabled: true, sticky: false, momentumRatio: 0.8 }}
            breakpoints={{
              640: { slidesPerView: 1.5, spaceBetween: 32 },
              1024: { slidesPerView: 2.2, spaceBetween: 40 },
              1536: { slidesPerView: 2.8, spaceBetween: 48 },
            }}
            className="!overflow-visible"
          >
            {collections.map((collection) => (
              <SwiperSlide key={collection.id} className="!h-auto">
                <Link 
                  href={`/collections/${collection.slug}`}
                  className="block relative aspect-[4/3] md:aspect-[16/10] rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-700"
                >
                  <Image
                    src={collection.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200'}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 40vw"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                    {collection.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {collection.tags.split(',').map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-inter font-bold text-white mb-3">
                      {collection.name}
                    </h3>
                    {collection.subtitle && (
                      <p className="text-white/80 font-primary text-sm md:text-base max-w-md mb-6 line-clamp-2">
                        {collection.subtitle}
                      </p>
                    )}
                    
                    <div className="inline-flex items-center gap-3 text-white text-sm font-primary font-bold uppercase tracking-wider mt-auto transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      Explore Collection
                      <div className="w-8 h-8 rounded-full bg-white text-alpha flex items-center justify-center">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
}
