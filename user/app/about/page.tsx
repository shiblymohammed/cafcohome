import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import AboutShowcase from "@/src/components/about/AboutShowcase";
import { generateMetadata as genMeta } from "@/src/lib/seo/utils";

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: "About Us - Our Story & Craftsmanship",
    description: "Discover CAFCOHOME's journey since 1985. Learn about our passion for creating exceptional furniture, our master craftsmen, and our commitment to quality and sustainability.",
    url: "/about",
    keywords: [
      "about CAFCOHOME",
      "furniture craftsmanship",
      "furniture company history",
      "sustainable furniture",
      "Italian furniture makers",
      "furniture artisans",
    ],
  });
}

const teamMembers = [
  {
    name: "Alessandro Rossi",
    role: "Founder & Creative Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Sofia Chen",
    role: "Head of Design",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Marcus Weber",
    role: "Master Craftsman",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Elena Dubois",
    role: "Sustainability Lead",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&auto=format&fit=crop",
  },
];

const milestones = [
  { year: "1985", event: "CAFCO founded in Milan, Italy" },
  { year: "1992", event: "First international showroom opens in Paris" },
  { year: "2005", event: "Launch of sustainable materials initiative" },
  { year: "2015", event: "Expansion to 25 countries worldwide" },
  { year: "2023", event: "Carbon neutral certification achieved" },
];

export default function AboutPage() {
  return (
    <main className="pt-20 bg-creme min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-black/5">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-4">
              <span className="w-8 h-[1px] bg-alpha/30"></span>
              Our Story
              <span className="w-8 h-[1px] bg-alpha/30"></span>
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-secondary text-alpha leading-[0.95] tracking-tight mb-6">
              Crafting <span className="italic font-light">Legacy</span>
            </h1>
            <p className="text-base md:text-lg text-alpha/70 font-primary leading-relaxed max-w-xl mx-auto">
              For nearly four decades, we&apos;ve been dedicated to creating furniture that transforms houses into homes.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-32">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop"
                  alt="CAFCO Workshop"
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-alpha/5 group-hover:bg-alpha/0 transition-colors duration-700" />
              </div>
              {/* Floating accent image */}
              <div className="absolute -bottom-8 -right-8 w-1/2 aspect-square border-8 border-creme overflow-hidden hidden md:block">
                <Image
                  src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop"
                  alt="Wood crafting detail"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-alpha/30"></span>
                The Beginning
              </span>
              <h2 className="text-3xl md:text-5xl font-secondary text-alpha leading-tight mb-8">
                A Passion for <span className="italic font-light">Perfection</span>
              </h2>
              <blockquote className="text-lg md:text-xl text-alpha/80 font-secondary leading-relaxed mb-8 border-l-2 border-alpha/10 pl-6 italic">
                &ldquo;We believe furniture should be more than functional. It should be a tactile expression of art, bringing silence and beauty to the modern home.&rdquo;
              </blockquote>
              <div className="space-y-6 text-sm font-primary text-alpha/70 leading-loose">
                <p>
                  Founded in 1985 in the heart of Milan, CAFCO began as a small workshop where master craftsmen pursued their passion for creating exceptional furniture. What started as a dream has grown into an internationally recognized brand, yet our commitment to quality and craftsmanship remains unchanged.
                </p>
                <p>
                  Every piece that leaves our workshop carries the legacy of traditional techniques combined with contemporary design sensibilities. We believe that furniture should tell a story—one of dedication, artistry, and the pursuit of perfection.
                </p>
              </div>
              <div className="flex items-center gap-12 mt-12">
                <div className="flex flex-col">
                  <span className="text-4xl font-secondary">1985</span>
                  <span className="text-[0.65rem] uppercase tracking-widest text-alpha/50 mt-1">Established</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-secondary">40+</span>
                  <span className="text-[0.65rem] uppercase tracking-widest text-alpha/50 mt-1">Artisans</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-secondary">25</span>
                  <span className="text-[0.65rem] uppercase tracking-widest text-alpha/50 mt-1">Countries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section - Auto-rotating */}
      <AboutShowcase />

      {/* Timeline Section */}
      <section className="py-16 md:py-32 border-b border-black/5">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-4">
              <span className="w-8 h-[1px] bg-alpha/30"></span>
              Our Journey
              <span className="w-8 h-[1px] bg-alpha/30"></span>
            </span>
            <h2 className="text-3xl md:text-5xl font-secondary text-alpha leading-tight">
              Key <span className="italic font-light">Milestones</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-8 md:gap-16 items-start pb-12 last:pb-0 group">
                <div className="flex-shrink-0 w-20 md:w-24">
                  <span className="text-2xl md:text-3xl font-secondary text-alpha group-hover:text-tango transition-colors duration-300">
                    {milestone.year}
                  </span>
                </div>
                <div className="flex-1 pt-1 border-l border-alpha/10 pl-8 md:pl-16">
                  <p className="text-base md:text-lg font-primary text-alpha/80">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-32">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-4">
              <span className="w-8 h-[1px] bg-alpha/30"></span>
              The People
              <span className="w-8 h-[1px] bg-alpha/30"></span>
            </span>
            <h2 className="text-3xl md:text-5xl font-secondary text-alpha leading-tight mb-4">
              Meet Our <span className="italic font-light">Team</span>
            </h2>
            <p className="text-base text-alpha/60 font-primary max-w-xl mx-auto">
              The passionate individuals behind every piece of furniture we create.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="relative aspect-square overflow-hidden mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-alpha/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-sm md:text-lg font-secondary text-alpha group-hover:text-tango transition-colors duration-300 leading-tight">
                  {member.name}
                </h3>
                <p className="text-[10px] md:text-xs font-primary uppercase tracking-wider text-alpha/50 mt-0.5 md:mt-1">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-ivory border-t border-black/5">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-alpha/30"></span>
                Visit Us
              </span>
              <h2 className="text-3xl md:text-5xl font-secondary text-alpha leading-tight mb-6">
                Experience Our <span className="italic font-light">Showroom</span>
              </h2>
              <p className="text-sm font-primary text-alpha/70 leading-loose mb-8 max-w-md">
                Step into our world and experience the quality and craftsmanship firsthand. Our design consultants are ready to help you find the perfect pieces for your space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-alpha text-creme text-xs uppercase tracking-widest font-primary hover:bg-alpha/90 transition-colors"
                >
                  Book a Visit
                </Link>
                <Link 
                  href="/collections/all" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-alpha text-alpha text-xs uppercase tracking-widest font-primary hover:bg-alpha hover:text-creme transition-colors"
                >
                  View Collections
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop"
                alt="CAFCO Showroom"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
