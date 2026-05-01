import { Metadata } from "next";
import { generateMetadata as genMeta } from "@/src/lib/seo/utils";
import AboutPageClient from "./AboutPageClient";

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: "About Us - Our Story & Craftsmanship",
    description: "Discover DravoHome's journey since 1985. Learn about our passion for creating exceptional furniture, our master craftsmen, and our commitment to quality and sustainability.",
    url: "/about",
    keywords: [
      "about DravoHome",
      "furniture craftsmanship",
      "furniture company history",
      "sustainable furniture",
      "Italian furniture makers",
      "furniture artisans",
    ],
  });
}

export default function AboutPage() {
  return (
    <main className="pt-20 bg-creme min-h-screen">
      <AboutPageClient />
    </main>
  );
}
