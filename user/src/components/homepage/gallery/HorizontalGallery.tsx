"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const galleryItems = [
  {
    id: 1,
    title: "Minimalist Living",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=80",
    category: "Interior",
  },
  {
    id: 2,
    title: "Abstract Forms",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80",
    category: "Design",
  },
  {
    id: 3,
    title: "Natural Elements",
    image: "https://images.unsplash.com/photo-1505693416383-d7a968eb1e40?w=1200&q=80",
    category: "Decor",
  },
  {
    id: 4,
    title: "Modern Lighting",
    image: "https://images.unsplash.com/photo-1513506003011-3b611ddab18b?w=1200&q=80",
    category: "Lighting",
  },
];

export default function HorizontalGallery() {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-neutral-900">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-20 pl-20 pr-20">
            <div className="min-w-[40vw] flex flex-col justify-center text-white z-10">
                 <h2 className="text-display font-secondary font-bold leading-none">
                    Artistic <br /> Vision
                </h2>
                <p className="mt-6 text-h3 font-light text-white/60 max-w-sm">
                    A journey through our design philosophy and aesthetic choices.
                </p>
            </div>
          {galleryItems.map((item) => (
            <GalleryItem key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function GalleryItem({ item }: { item: typeof galleryItems[0] }) {
  return (
    <div className="relative h-[60vh] min-w-[50vw] md:min-w-[40vw] overflow-hidden group">
      <motion.img
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 p-8 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
        <span className="text-xs uppercase tracking-widest text-white/70 mb-2 block">
            {item.category}
        </span>
        <h3 className="text-4xl font-secondary text-white font-bold">{item.title}</h3>
      </div>
    </div>
  );
}
