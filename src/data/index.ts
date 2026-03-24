export const brands = [
    "Nike",
    "Supreme",
    "Adidas",
    "Palace",
    "Bravest Studios",
    "True Religion",
    "YZY GAP",
    "Puma",
    "Levis",
    "Cactus Jack",
];

export interface Product {
    id: number | string;
    name: string;
    brand: string;
    price: number;
    image: string;
    trending?: boolean;
    onSale?: boolean;
    salePrice?: number;
}

export const products: Product[] = [
    {
        id: 2,
        name: "NIKE DN8 Talla 6",
        brand: "Nike",
        price: 160,
        image: "/images/nike-dn8.png",
        trending: true,
    },
    {
        id: 10,
        name: "Adidas Vintage Green",
        brand: "Adidas",
        price: 140,
        image: "/images/adidas-1.png",
        trending: true,
        onSale: true,
        salePrice: 110,
    },
    {
        id: 11,
        name: "Supreme Camo Jacket",
        brand: "Supreme",
        price: 250,
        image: "/images/supreme-1.png",
        trending: true,
    },
    {
        id: 12,
        name: "Supreme NY White Bomber",
        brand: "Supreme",
        price: 210,
        image: "/images/supreme-2.png",
    },
    {
        id: 13,
        name: "Palace Tri-Ferg Eyes Tee",
        brand: "Palace",
        price: 85,
        image: "/images/palace-1.png",
        onSale: true,
        salePrice: 65,
    },
    {
        id: 14,
        name: "Palace Pro Team Cowboy Tee",
        brand: "Palace",
        price: 85,
        image: "/images/palace-2.png",
    },
    {
        id: 15,
        name: "Palace Item 3",
        brand: "Palace",
        price: 90,
        image: "/images/palace-3.png",
        trending: true,
    },
    {
        id: 16,
        name: "Cactus Jack Topia Tour",
        brand: "Cactus Jack",
        price: 120,
        image: "/images/cactus-1.png",
        trending: true,
        onSale: true,
        salePrice: 95,
    },
];

export const reels = [
    {
        id: 1,
        isEmbed: true,
        videoUrl: "https://www.instagram.com/p/DRS7reejUQK/embed",
        poster: "",
    },
    {
        id: 2,
        isEmbed: true,
        videoUrl: "https://www.instagram.com/p/DSGHTn-klSL/embed",
        poster: "",
    },
    {
        id: 3,
        isEmbed: true,
        videoUrl: "https://www.instagram.com/p/DVZrWChlbLw/embed",
        poster: "",
    },
    {
        id: 4,
        isEmbed: true,
        videoUrl: "https://www.instagram.com/p/DRTDFQ1jhdz/embed",
        poster: "",
    },
    {
        id: 5,
        isEmbed: true,
        videoUrl: "https://www.instagram.com/p/DPTthN_DbbZ/embed",
        poster: "",
    },
    {
        id: 6,
        isEmbed: true,
        videoUrl: "https://www.instagram.com/p/DO6XUGiDW4R/embed",
        poster: "",
    },
];
