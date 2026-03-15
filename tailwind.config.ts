import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    red: "#CC0000",
                    black: "#1a1a1a",
                    bg: "#F5F5F5",
                }
            },
            fontFamily: {
                heading: ["var(--font-heading)", "sans-serif"],
                sans: ["var(--font-sans)", "sans-serif"],
            }
        },
    },
    plugins: [],
} satisfies Config;
