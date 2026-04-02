"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicProducts() {
    try {
        const products = await prisma.product.findMany({
            where: { is_active: true },
            include: {
                brand: true,
                variants: true,
                images: {
                    orderBy: { display_order: 'asc' }
                }
            },
            orderBy: { created_at: "desc" }
        });

        // Formatear para el frontend Product Carousel format
        return products.map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand?.name || "Sin Marca",
            price: Number(p.base_price),
            image: p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url || "/images/brands-bg.png",
            trending: p.is_trending,
            onSale: p.sale_price !== null && Number(p.sale_price) < Number(p.base_price),
            salePrice: p.sale_price ? Number(p.sale_price) : undefined,
            // Agregamos stock total por si necesitamos deshabilitar el botón de compra
            stock: p.variants.reduce((acc, v) => acc + v.stock_quantity, 0)
        }));
    } catch (error) {
        console.error("Error fetching public products:", error);
        return [];
    }
}

export async function getPublicBrands() {
    try {
        return await prisma.brand.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching public brands:", error);
        return [];
    }
}
