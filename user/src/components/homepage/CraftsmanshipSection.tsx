"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const storySteps = [
  {
    id: "step-1",
    headline: "Uncompromising Materials.",
    subheadline: "Selected by hand.",
    description: "Every piece begins with responsibly sourced solid hardwoods — teak, walnut, and oak. We reject particle boards and veneers. Only materials that age gracefully make the cut.",
    image: "https://images.unsplash.com/photo-1611084225028-2ab96a928ba5?q=80&w=1600",
  },
  {
    id: "step-2",
    headline: "Time-Honored Joinery.",
    subheadline: "No shortcuts.",
    description: "Mortise and tenon. Hand-cut dovetails. Wooden pegs. We use techniques that have stood the test of centuries, ensuring structural integrity that outlasts screws and glue.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1600",
  },
  {
    id: "step-3",
    headline: "Designed for Generations.",
    subheadline: "Built to remain.",
    description: "We design against obsolescence. A DravoHome piece is built to be repaired, refinished, and passed on. A true heirloom only gets better with time.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1600",
  },
];

export default function CraftsmanshipSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate opacities for the 3 images based on scroll progress
  // 0.0 to 0.33 -> Image 1
  // 0.33 to 0.66 -> Image 2
  // 0.66 to 1.0 -> Image 3
  
  const img1Opacity = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const img2Opacity = useTransform(scrollYProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0]);
  const img3Opacity = useTransform(scrollYProgress, [0.6, 0.7, 1], [0, 1, 1]);

  const img1Scale = useTransform(scrollYProgress, [0, 0.35], [1, 1.05]);
  const img2Scale = useTransform(scrollYProgress, [0.25, 0.7], [1, 1.05]);
  const img3Scale = useTransform(scrollYProgress, [0.6, 1], [1, 1.05]);

  return (
    <section className="bg-[#000000] text-[#f5f5f7] selection:bg-white/20">
      
      {/* Intro sequence */}
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#86868b] font-inter text-sm md:text-base tracking-[0.2em] uppercase mb-6"
        >
          The DravoHome Standard
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-inter text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight max-w-4xl leading-[1.1]"
        >
          Craft is not a feature.<br />
          <span className="text-[#86868b]">It’s the foundation.</span>
        </motion.h2>
      </div>

      {/* Sticky Storytelling Container */}
      <div ref={containerRef} className="relative w-full">
        
        {/* Mobile View: Linear stack, no sticky images */}
        <div className="md:hidden flex flex-col px-6 pb-24 gap-24">
          {storySteps.map((step) => (
            <div key={`mobile-${step.id}`} className="flex flex-col gap-8">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden">
                <Image src={step.image} alt={step.headline} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-inter text-3xl font-semibold tracking-tight mb-2">
                  {step.headline}
                </h3>
                <h4 className="font-inter text-xl text-[#86868b] font-medium tracking-tight mb-6">
                  {step.subheadline}
                </h4>
                <p className="font-inter text-[#a1a1a6] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Sticky Images + Scrolling Text */}
        <div className="hidden md:flex max-w-[1400px] mx-auto px-12 lg:px-24">
          
          {/* Left Column: Scrolling Text */}
          <div className="w-1/2 pb-[30vh]">
            {storySteps.map((step) => (
              <div 
                key={step.id} 
                className="h-screen flex flex-col justify-center pr-16 lg:pr-24"
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-20% 0px -20% 0px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="font-inter text-4xl lg:text-5xl font-semibold tracking-tight mb-2 text-white">
                    {step.headline}
                  </h3>
                  <h4 className="font-inter text-2xl lg:text-3xl text-[#86868b] font-medium tracking-tight mb-8">
                    {step.subheadline}
                  </h4>
                  <p className="font-inter text-lg text-[#a1a1a6] leading-[1.6] max-w-md">
                    {step.description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Images */}
          <div className="w-1/2 h-screen sticky top-0 flex items-center justify-center py-24">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#111]">
              
              {/* Image 1 */}
              <motion.div 
                className="absolute inset-0 will-change-transform"
                style={{ opacity: img1Opacity, scale: img1Scale }}
              >
                <Image src={storySteps[0].image} alt="Materials" fill className="object-cover" priority />
              </motion.div>

              {/* Image 2 */}
              <motion.div 
                className="absolute inset-0 will-change-transform"
                style={{ opacity: img2Opacity, scale: img2Scale }}
              >
                <Image src={storySteps[1].image} alt="Joinery" fill className="object-cover" />
              </motion.div>

              {/* Image 3 */}
              <motion.div 
                className="absolute inset-0 will-change-transform"
                style={{ opacity: img3Opacity, scale: img3Scale }}
              >
                <Image src={storySteps[2].image} alt="Longevity" fill className="object-cover" />
              </motion.div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
