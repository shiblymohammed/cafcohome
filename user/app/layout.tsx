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

const hammersmith = Hammersmith_One({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-hammersmith",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
    variable: "--font-playfair",
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
});

const abrilFatface = Abril_Fatface({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-abril",
    display: "swap",
});

export const metadata: Metadata = {
    title: "CAFCOHOME - Furniture Ecommerce",
    description: "Premium furniture for your home",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="overflow-x-clip" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className={`${hammersmith.variable} ${playfair.variable} ${inter.variable} ${abrilFatface.variable} font-primary overflow-x-clip w-full`} suppressHydrationWarning>
                <SessionProvider>
                    <ToastProvider>
                        <CartProvider>
                            <WishlistProvider>
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
