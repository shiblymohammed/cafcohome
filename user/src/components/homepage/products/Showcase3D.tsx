"use client";
import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Showcase3D() {
  return (
    <section className="py-24 bg-ivory">
        <div className="mb-16 text-center">
            <h2 className="text-h2 font-secondary font-bold text-text-primary">Featured Masterpieces</h2>
            <p className="text-text-secondary mt-2">Hover to explore details</p>
        </div>
      <div className="flex flex-wrap justify-center gap-12 px-4 max-w-content mx-auto">
        <TiltCard 
            title="Eames Lounge Chair" 
            price="$5,200" 
            image="https://images.unsplash.com/photo-1567538090136-9f33ae6f7e2a?w=600&q=80"
        />
        <TiltCard 
            title="Noguchi Table" 
            price="$2,400" 
            image="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80"
        />
        <TiltCard 
            title="Arco Lamp" 
            price="$3,100" 
            image="https://images.unsplash.com/photo-1513506003011-3b611ddab18b?w=600&q=80"
        />
      </div>
    </section>
  );
}

function TiltCard({ title, price, image }: { title: string, price: string, image: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative w-80 h-[450px] rounded-xl bg-white shadow-xl cursor-grab"
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-4 rounded-lg bg-creme shadow-inner overflow-hidden"
      >
        <img src={image} alt={title} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
      </div>
      
      <div 
        style={{ transform: "translateZ(150px)" }}
        className="absolute bottom-12 left-8 z-20 pointer-events-none"
      >
        <h3 className="text-2xl font-bold text-white font-secondary shadow-black drop-shadow-lg">{title}</h3>
        <p className="text-white/90 font-bold mt-1 text-lg">{price}</p>
      </div>

       <div 
        style={{ transform: "translateZ(100px)" }}
        className="absolute top-8 right-8 z-20"
      >
        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-badge text-xs font-bold uppercase tracking-wider border border-white/30">
            Premium
        </span>
      </div>
    </motion.div>
  );
}
