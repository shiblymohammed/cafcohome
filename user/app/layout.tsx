        import type { Metadata } from "next";
import { Hammersmith_One, Playfair_Display, Inter, Abril_Fatface } from "next/font/google";
import "./globals.css";
import "@/src/styles/select-override.css";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import MobileFooter from "@/src/components/layout/MobileFooter";
import MobileNav from "@/src/components/layout/MobileNav";
import SessionProvider from "@/src/components/providers/SessionProvider";
import { CartProvider } from "@/src/contexts/CartContext";
import { WishlistProvider } from "@/src/contexts/WishlistContext";
import { ToastProvider } from "@/src/contexts/ToastContext";
import OfferMarquee from "@/src/components/layout/OfferMarquee";
import WelcomeOfferModal from "@/src/components/modals/WelcomeOfferModal";

const hammersmith = Hammersmith_One({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-hammersmith",
    display: "swap",
    preload: false,
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
    variable: "--font-playfair",
    display: "swap",
    preload: false,
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
    preload: false,
});

const abrilFatface = Abril_Fatface({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-abril",
    display: "swap",
    preload: false,
});

export const metadata: Metadata = {
    title: "DravoHome - Premium Furniture Ecommerce",
    description: "Premium furniture for your dream home",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="overflow-x-clip" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '4199897750262350');
                            fbq('track', 'PageView');
                        `,
                    }}
                />
                <noscript>
                    <img height="1" width="1" style={{ display: "none" }}
                        src="https://www.facebook.com/tr?id=4199897750262350&ev=PageView&noscript=1"
                        alt=""
                    />
                </noscript>
            </head>
            <body className={`${hammersmith.variable} ${playfair.variable} ${inter.variable} ${abrilFatface.variable} font-primary overflow-x-clip w-full`} suppressHydrationWarning>
                <SessionProvider>
                    <ToastProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <WelcomeOfferModal />
                                <OfferMarquee />
                                <Navbar />
                                <main className="overflow-x-clip">
                                    {children}
                                </main>
                                <Footer />
                                <MobileFooter />
                                <MobileNav />
                            </WishlistProvider>
                        </CartProvider>
                    </ToastProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
