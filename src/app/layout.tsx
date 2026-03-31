import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
    title: "HIGHHOOD | FROM THE HOOD TO THE WORLD",
    description: "Modern streetwear e-commerce brand. Urban clothing, oversized fashion.",
    icons: {
        icon: "/images/logo.png",
        shortcut: "/images/logo.png",
        apple: "/images/logo.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${oswald.variable} font-sans antialiased text-brand-black bg-brand-bg`}>
                <AuthProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
