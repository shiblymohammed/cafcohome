import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiClient } from "@/src/lib/api";
import { Tag, Calendar, Package, ArrowLeft } from "lucide-react";
import Image from "next/image";
import OfferClient from "./OfferClient";

// Force revalidation every 60 seconds
export const revalidate = 60;

interface OfferDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OfferDetailPageProps) {
  const { id } = await params;
  
  try {
    const offer = await ApiClient.getOfferById(id);
    
    return {
      title: `${offer.name} - Special Offer | CAFCO Home`,
      description: offer.description,
    };
  } catch (error) {
    return {
      title: "Offer Not Found - CAFCO Home",
      description: "The offer you're looking for could not be found.",
    };
  }
}

async function getOfferWithProducts(id: string) {
  try {
    const offer = await ApiClient.getOfferById(id);
    
    // Check if offer is valid
    const now = new Date();
    const endDate = new Date(offer.end_date);
    if (!offer.is_active || endDate < now) {
      return null;
    }
    
    // Use applicable_products from the API response
    const products = offer.applicable_products || [];
    
    return { offer, products };
  } catch (error) {
    console.error("Error fetching offer:", error);
    return null;
  }
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { id } = await params;
  const data = await getOfferWithProducts(id);

  if (!data) {
    notFound();
  }

  const { offer, products } = data;

  const daysLeft = Math.ceil(
    (new Date(offer.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-creme selection:bg-tango selection:text-white pb-20">
      
      {/* Immersive Hero Section */}
      <div className="relative bg-alpha py-20 md:py-32 overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tango/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 text-center flex flex-col items-center">
          
          <Link 
            href="/offers"
            className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.2em] text-ivory/60 hover:text-tango mb-10 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Offers</span>
          </Link>
          
          <span className="inline-block px-4 py-1.5 text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] backdrop-blur-md bg-white/10 text-creme border border-white/20 rounded-full mb-8">
            {offer.apply_to} Exclusive
          </span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-secondary text-ivory mb-6 tracking-tight leading-[0.9] max-w-4xl">
            {offer.name}
          </h1>
          
          <p className="text-ivory/70 text-sm md:text-base font-primary max-w-2xl leading-relaxed mb-12">
            {offer.description}
          </p>

          <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm min-w-[280px]">
             <div className="text-7xl md:text-8xl font-secondary italic text-tango mb-2 leading-none shadow-tango/20 drop-shadow-2xl">
               {offer.discount_percentage}%
             </div>
             <div className="text-ivory/60 font-primary text-xs uppercase tracking-[0.4em]">
               Discount
             </div>
          </div>
        </div>
      </div>

      {/* Editorial Meta Bar */}
      <div className="border-b border-alpha/10 bg-white/50 backdrop-blur-md sticky top-0 md:top-24 z-40 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-5">
           <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-12 text-xs font-primary uppercase tracking-widest text-alpha/70">
              
              {offer.applicable_items_display && (
                <div className="flex items-center gap-3">
                   <Tag className="w-4 h-4 text-tango" />
                   <span><span className="opacity-50">Applies to:</span> <span className="text-alpha font-medium">{offer.applicable_items_display}</span></span>
                </div>
              )}

              <div className="flex items-center gap-3">
                 <Calendar className="w-4 h-4 text-tango" />
                 <span><span className="opacity-50">Valid Until:</span> <span className="text-alpha font-medium">
                   {new Date(offer.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                 </span></span>
              </div>

              {daysLeft > 0 && (
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-tango animate-pulse" />
                   <span className="text-tango font-medium">{daysLeft} Days Remaining</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                 <Package className="w-4 h-4 text-tango" />
                 <span><span className="text-alpha font-medium">{products.length}</span> <span className="opacity-50">Eligible Products</span></span>
              </div>
           </div>
        </div>
      </div>

      {/* Eligible Products Grid */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-24">
        
        <div className="mb-16 md:flex items-end justify-between">
            <div className="max-w-2xl">
               <h2 className="text-3xl md:text-5xl font-secondary text-alpha mb-4">
                  Curated Selection
               </h2>
               <p className="text-xs font-primary uppercase tracking-widest text-alpha/50">
                  Explore pieces eligible for your {offer.discount_percentage}% discount.
               </p>
            </div>
            {/* Elegant "How to" pill */}
            <div className="hidden md:flex items-center gap-3 bg-white border border-alpha/10 rounded-full px-5 py-2.5 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-tango" />
               <span className="text-[10px] font-primary uppercase tracking-widest text-alpha/70">
                  Add to cart for quoted discount
               </span>
            </div>
        </div>

        <OfferClient offer={offer} products={products} />
      </div>

      {/* Elegant Redemption Block */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 mt-10">
         <div className="bg-alpha text-creme p-10 md:p-20 text-center relative overflow-hidden rounded-sm group">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-tango/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 max-w-2xl mx-auto">
               <h3 className="text-3xl md:text-5xl font-secondary mb-6 italic">
                  Seamless Redemption
               </h3>
               <p className="text-creme/70 text-sm md:text-base font-primary leading-relaxed mb-10">
                  Select your desired eligible pieces and proceed to checkout. Your dedicated CAFCO advisor will apply the <strong className="text-tango font-normal">{offer.discount_percentage}% {offer.name}</strong> discount directly on your personalized WhatsApp quotation.
               </p>
               <Link
                  href="/cart"
                  className="inline-flex items-center gap-4 px-10 py-4 border border-creme/30 text-xs font-primary uppercase tracking-[0.2em] hover:bg-creme hover:text-alpha transition-all duration-500"
               >
                  View Your Selection
                  <ArrowLeft className="w-4 h-4 rotate-180" />
               </Link>
            </div>
         </div>
      </div>

    </div>
  );
}
