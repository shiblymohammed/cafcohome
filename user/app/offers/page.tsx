import Link from "next/link";
import { Metadata } from "next";
import { ApiClient } from "@/src/lib/api";
import { Tag, Calendar, ArrowRight } from "lucide-react";
import { generateMetadata as genMeta } from "@/src/lib/seo/utils";

// Force revalidation every 60 seconds
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: "Special Offers & Deals - Exclusive Furniture Discounts",
    description: "Discover exclusive furniture deals and promotions at DravoHome. Save on quality furniture for your home with our limited-time offers on premium collections.",
    url: "/offers",
    keywords: [
      "furniture deals",
      "furniture discounts",
      "special offers",
      "furniture sale",
      "home decor deals",
      "furniture promotions",
    ],
  });
}

async function getOffers() {
  try {
    const data: any = await ApiClient.getOffers();
    return Array.isArray(data) ? data : (data?.results || []);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return [];
  }
}

export default async function OffersPage() {
  const offers = await getOffers();

  const activeOffers = offers.filter((offer: any) => {
    const now = new Date();
    const endDate = new Date(offer.end_date);
    return offer.is_active && endDate > now;
  });

  return (
    <div className="min-h-screen bg-creme selection:bg-tango selection:text-white">
      
      {/* Immersive Hero Section */}
      <div className="relative bg-alpha py-24 md:py-36 overflow-hidden">
        {/* Abstract Lighting Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tango/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 text-center flex flex-col items-center">
          <span className="inline-block px-5 py-2 text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] backdrop-blur-md bg-white/10 text-creme border border-white/20 rounded-full mb-8">
            The Journal of Savings
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-secondary text-ivory mb-6 tracking-tight leading-[0.9]">
            Exclusive <i className="text-tango">Promotions</i>
          </h1>
          <p className="text-ivory/80 text-sm md:text-base font-primary uppercase tracking-widest max-w-2xl mx-auto">
            Limited time deals on our most sought-after collections.
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
        {activeOffers.length === 0 ? (
          <div className="text-center py-24 bg-white border border-alpha/10 max-w-3xl mx-auto rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-alpha/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
               <Tag className="w-16 h-16 mx-auto text-alpha/30 mb-6" />
               <h3 className="text-3xl font-secondary text-alpha mb-4">
                  Offers Updating
               </h3>
               <p className="text-alpha/60 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-primary">
                  We are currently refreshing our promotional events. Check back soon for beautiful additions to your space.
               </p>
               <Link
                  href="/products"
                  className="inline-flex items-center gap-3 px-8 py-3 bg-alpha text-creme text-xs uppercase tracking-widest hover:bg-tango transition-colors"
               >
                  Explore Collections
               </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {activeOffers.map((offer: any, index: number) => {
              const daysLeft = Math.ceil(
                (new Date(offer.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              // Cycle premium themes
              const themes = [
                 { bg: "bg-alpha", text: "text-creme", accent: "text-tango", drop: "bg-[#111]" },
                 { bg: "bg-[#252525]", text: "text-white", accent: "text-gold", drop: "bg-[#1A1A1A]" },
                 { bg: "bg-[#8B4513]", text: "text-ivory", accent: "text-alpha", drop: "bg-[#6A320A]" },
                 { bg: "bg-creme", text: "text-alpha", accent: "text-[#8B4513]", drop: "bg-white border border-alpha/10" }
              ];
              const theme = themes[index % themes.length];
              const isLight = theme.bg === "bg-creme";

              return (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.id}`}
                  className="group flex flex-col h-full transform transition-transform duration-500 hover:-translate-y-2"
                >
                  {/* Offer Abstract Header Card */}
                  <div className={`${theme.bg} ${theme.text} p-10 relative overflow-hidden rounded-t-sm flex-1 flex flex-col justify-center min-h-[300px]`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-white/20 transition-colors duration-700" />
                    
                    <div className="relative z-10 text-center">
                       <span className={`inline-block px-3 py-1 text-[9px] uppercase tracking-[0.3em] backdrop-blur-md bg-white/10 ${isLight ? 'border-alpha/30' : 'border-white/20'} border rounded-full mb-6`}>
                          {offer.apply_to} Valid
                       </span>
                       
                       <div className="flex flex-col items-center justify-center mb-6">
                          <div className={`text-7xl font-secondary italic ${theme.accent} leading-none mb-2 drop-shadow-md`}>
                             {offer.discount_percentage}%
                          </div>
                          <div className="text-xs font-primary uppercase tracking-[0.4em] opacity-80">
                             Discount
                          </div>
                       </div>

                       <h2 className="text-2xl font-secondary leading-snug mb-2 line-clamp-2">
                          {offer.name}
                       </h2>
                    </div>
                  </div>

                  {/* Offer Meta Footer */}
                  <div className={`${theme.drop} p-8 rounded-b-sm flex flex-col shadow-xl shadow-alpha/5 flex-grow-0`}>
                    <p className={`text-sm ${isLight ? 'text-alpha/70' : 'text-white/70'} mb-6 line-clamp-3 leading-relaxed font-primary`}>
                      {offer.description}
                    </p>

                    <div className="mt-auto space-y-4">
                       <div className={`flex items-center gap-3 text-xs uppercase tracking-widest ${isLight ? 'text-alpha/60' : 'text-white/60'}`}>
                         <Calendar className="w-4 h-4" />
                         <span>Ends {new Date(offer.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                       </div>
                       
                       {daysLeft > 0 && daysLeft <= 7 && (
                         <div className={`flex items-center gap-3 text-xs uppercase tracking-widest ${theme.accent}`}>
                           <Tag className="w-4 h-4" />
                           <span className="font-medium">{daysLeft} days remaining!</span>
                         </div>
                       )}

                       <div className={`mt-6 pt-6 border-t ${isLight ? 'border-alpha/10' : 'border-white/10'} flex items-center justify-between group-hover:${theme.accent} transition-colors duration-300`}>
                          <span className={`text-[10px] font-primary uppercase tracking-[0.2em] ${isLight ? 'text-alpha' : 'text-white'}`}>
                             View Eligible Items
                          </span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Section - Editorial */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 mb-24 md:mb-32">
         <div className="bg-alpha text-creme p-12 md:p-24 text-center relative overflow-hidden rounded-sm group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tango/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10 max-w-2xl mx-auto">
               <h3 className="text-3xl md:text-5xl font-secondary mb-6 italic">
                  Redeeming Your Offer
               </h3>
               <p className="text-creme/70 text-sm md:text-base font-primary leading-relaxed mb-10">
                  Select your desired eligible pieces and proceed to checkout. Your dedicated DravoHome advisor will apply the applicable discounts directly on your personalized WhatsApp quotation.
               </p>
               <Link
                  href="/products"
                  className="inline-flex items-center gap-4 px-10 py-4 border border-creme/30 text-xs font-primary uppercase tracking-[0.2em] hover:bg-creme hover:text-alpha transition-all duration-500"
               >
                  Browse Full Collection
                  <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>
      </div>

    </div>
  );
}
