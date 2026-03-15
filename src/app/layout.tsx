import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
    title: "HIGHHOOD | FROM THE HOOD TO THE WORLD",
    description: "Modern streetwear e-commerce brand. Urban clothing, oversized fashion.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${oswald.variable} font-sans antialiased text-brand-black bg-brand-bg`}>
                {children}
            </body>
        </html>
    );
}
