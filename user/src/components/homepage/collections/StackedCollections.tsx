"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const projects = [
  {
    title: "The Lounge",
    description: "Designed for ultimate relaxation and social connection.",
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    color: "#BBACAF",
  },
  {
    title: "Office Space",
    description: "Productivity meets premium aesthetics.",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    color: "#977F6D",
  },
  {
    title: "Kitchen & Dining",
    description: "Culinary excellence in a refined setting.",
    src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
    color: "#C2491D",
  },
  {
    title: "Bedroom Suites",
    description: "Serenity and comfort for the modern home.",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    color: "#88A28D",
  },
];

export default function StackedCollections() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={container} className="relative mt-[20vh] mb-[20vh]">
        <div className="mb-24 px-4 max-w-content mx-auto text-center">
            <h2 className="text-display font-secondary font-bold text-text-primary">
                Signature <br /> Collections
            </h2>
        </div>
      {projects.map((project, i) => {
        const targetScale = 1 - (projects.length - i) * 0.05;
        return (
          <Card
            key={i}
            i={i}
            {...project}
            progress={scrollYProgress}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </section>
  );
}

interface CardProps {
  i: number;
  title: string;
  description: string;
  src: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const Card = ({ i, title, description, src, color, progress, range, targetScale }: CardProps) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0">
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className="flex flex-col relative h-[500px] w-[1000px] rounded-card p-12 origin-top shadow-modal"
      >
        <h2 className="text-center m-0 text-4xl font-secondary font-bold text-white">{title}</h2>
        <div className="flex h-full mt-12 gap-12">
          <div className="w-[40%] relative top-[10%]">
            <p className="text-lg text-white/90 font-primary line-clamp-4 first-letter:text-3xl first-letter:font-bold">
                {description}
            </p>
            <span className="flex items-center gap-2 mt-6 text-white font-bold uppercase tracking-wider text-sm cursor-pointer group">
              View Collection 
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>

          <div className="relative w-[60%] h-full rounded-lg overflow-hidden border-4 border-white/20">
            <motion.div className="w-full h-full" style={{ scale: imageScale }}>
              <img src={src} alt="image" className="object-cover w-full h-full" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
