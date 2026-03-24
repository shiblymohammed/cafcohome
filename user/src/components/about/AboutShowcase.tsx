"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const showcaseData = [
  {
    id: "craftsmanship",
    label: "Craftsmanship",
    title: "Handcrafted Excellence",
    quote: "Every piece is handcrafted by skilled artisans using time-honored techniques passed down through generations.",
    description: "Our master craftsmen bring decades of experience to every piece, ensuring each creation meets the highest standards of quality and artistry.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "design",
    label: "Design Services",
    title: "Personalized Design",
    quote: "Our design team works closely with you to create spaces that reflect your unique style and vision.",
    description: "From concept to completion, our expert designers guide you through every step, ensuring your furniture perfectly complements your living space.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "service",
    label: "Customer Service",
    title: "Dedicated Support",
    quote: "We believe in building lasting relationships with our customers through exceptional service and care.",
    description: "Our dedicated team is always ready to assist you, from initial consultation to after-sales support, ensuring your complete satisfaction.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "delivery",
    label: "Delivery",
    quote: "Fuss-free and easy to deal with. We appreciate the pre-delivery reminder and the fact that assembly is included.",
    title: "Seamless Delivery",
    description: "White-glove delivery service with professional assembly included. We handle everything so you can simply enjoy your new furniture.",
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function AboutShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % showcaseData.length);
        setIsTransitioning(false);
      }, 300);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const handleOptionClick = (index: number) => {
    if (index !== activeIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const currentItem = showcaseData[activeIndex];

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* Left - Image */}
        <div className="relative h-[400px] lg:h-auto overflow-hidden">
          <Image
            src={currentItem.image}
            alt={currentItem.title}
            fill
            className={`object-cover transition-all duration-700 ${
              isTransitioning ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />
        </div>

        {/* Right - Dark Content */}
        <div className="bg-alpha flex flex-col justify-between p-8 md:p-12 lg:p-16">
          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-center">
            <div
              className={`transition-all duration-500 ${
                isTransitioning
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <span className="text-xs font-primary uppercase tracking-[0.25em] text-creme/40 mb-4 block">
                {currentItem.label}
              </span>
              <h3 className="text-2xl md:text-3xl font-secondary text-creme mb-6">
                {currentItem.title}
              </h3>
              <blockquote className="text-lg md:text-xl lg:text-2xl text-creme/90 font-secondary leading-relaxed mb-6 italic">
                &ldquo;{currentItem.quote}&rdquo;
              </blockquote>
              <p className="text-sm text-creme/60 font-primary leading-relaxed max-w-md">
                {currentItem.description}
              </p>
            </div>
          </div>

          {/* Bottom Options */}
          <div className="mt-12 pt-8 border-t border-creme/10">
            <div className="flex flex-wrap gap-4 md:gap-8">
              {showcaseData.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleOptionClick(index)}
                  className={`text-xs font-primary uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    index === activeIndex
                      ? "text-creme"
                      : "text-creme/40 hover:text-creme/70"
                  }`}
                >
                  {index === activeIndex && (
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
