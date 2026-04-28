"use client";

import Image from "next/image";
import { Play, Heart, MessageCircle, Instagram } from "lucide-react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

// Mock data representing Instagram hashtag feed
const INSTAGRAM_POSTS = [
  {
    id: "1",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
    videoUrl: "", 
    likes: "12.4K",
    comments: "342",
    username: "@interior.dreams"
  },
  {
    id: "2",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop",
    likes: "8.9K",
    comments: "156",
    username: "@cafcohome.fan"
  },
  {
    id: "3",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop",
    likes: "15.2K",
    comments: "892",
    username: "@minimalist.living"
  },
  {
    id: "4",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop",
    likes: "5.4K",
    comments: "89",
    username: "@lux.spaces"
  },
  {
    id: "5",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop",
    likes: "21.1K",
    comments: "1.2K",
    username: "@design.daily"
  },
  {
    id: "6",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop",
    likes: "9.8K",
    comments: "412",
    username: "@home.vibes"
  }
];

export default function InstagramFeed() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden py-12 md:py-16 bg-creme border-t border-alpha/[0.03]">
      <div className="max-w-[2400px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="px-4 md:px-8 xl:px-16 2xl:px-24 mb-8 md:mb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center gap-3 w-14 h-14 rounded-full bg-gradient-to-tr from-[#fd5949] to-[#d6249f] p-[2px] mb-4 shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-creme rounded-full flex items-center justify-center">
               <Instagram className="w-7 h-7 text-alpha" />
            </div>
          </div>
          <span className="inline-flex items-center justify-center gap-4 text-xs md:text-sm font-primary uppercase tracking-[0.4em] text-gold font-bold mb-4">
            <span className="w-8 h-[2px] bg-gold" />
            Social Feed
            <span className="w-8 h-[2px] bg-gold" />
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-[5.5rem] font-inter font-black tracking-tighter text-alpha leading-[0.9] uppercase">
            #CafcoHome
          </h2>
          <p className="text-alpha/60 font-primary text-sm md:text-base max-w-lg leading-relaxed mt-4">
            Explore how our community styles their spaces. Tag us on Instagram to be featured in our daily interior inspirations.
          </p>
        </div>

        {/* Carousel */}
        <div className="w-full px-4 md:px-8 lg:px-12">
          <Swiper
            modules={[FreeMode, Autoplay]}
            spaceBetween={16}
            slidesPerView={1.5}
            speed={800}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            freeMode={{ enabled: true, sticky: false, momentumRatio: 0.8 }}
            grabCursor={true}
            breakpoints={{
              480: { slidesPerView: 2.2, spaceBetween: 20 },
              768: { slidesPerView: 3.2, spaceBetween: 24 },
              1024: { slidesPerView: 4.5, spaceBetween: 32 },
              1536: { slidesPerView: 5.5, spaceBetween: 32 },
            }}
            className="!overflow-visible !pb-6"
          >
            {INSTAGRAM_POSTS.map((post) => (
              <SwiperSlide key={post.id} className="!h-auto">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block relative aspect-[9/16] rounded-[2rem] overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-500"
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Image
                    src={post.thumbnail}
                    alt={post.username}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  
                  {/* Top Gradient & Username */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10 p-5">
                    <span className="text-white font-primary font-bold text-sm tracking-wide shadow-sm">
                      {post.username}
                    </span>
                  </div>

                  {/* Reel Icon Overlay */}
                  <div className="absolute top-5 right-5 z-10 text-white/90">
                    <svg className="w-5 h-5 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                  </div>

                  {/* Play Button - Centered */}
                  <div className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-500 ${hoveredId === post.id ? 'bg-black/20' : 'bg-transparent'}`}>
                    <div className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 transition-transform duration-500 ${hoveredId === post.id ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}`}>
                      <Play className="w-5 h-5 text-white ml-1 fill-white" />
                    </div>
                  </div>

                  {/* Bottom Gradient & Stats */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 p-5 flex flex-col justify-end">
                    <div className="flex items-center gap-4 text-white/90">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-white" />
                        <span className="font-primary font-bold text-xs">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span className="font-primary font-bold text-xs">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
}
