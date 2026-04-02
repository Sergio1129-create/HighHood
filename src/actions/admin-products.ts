"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    if (user.email === 'admin.highood.com' || user.email === 'admin@highhood.com') {
        return true;
    }

    const profile = await prisma.customerProfile.findUnique({
        where: { id: user.id }
    });

    return profile?.role === "ADMIN";
}

export type ProductInput = {
    name: string;
    brand_id?: string | null;
    description?: string | null;
    base_price: number;
    sale_price?: number | null;
    is_active?: boolean;
    is_trending?: boolean;
    variants: { id?: string, size: string, color?: string | null, stock_quantity: number, sku?: string | null }[];
    images: { id?: string, url: string, is_primary: boolean }[];
};

export async function getAdminProducts() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const products = await prisma.product.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            brand: true,
            variants: true,
            images: { orderBy: { display_order: 'asc' } },
            categories: { include: { category: true } }
        }
    });

    // Server actions cannot pass Decimal objects to Client Components.
    return products.map(p => ({
        ...p,
        base_price: Number(p.base_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null
    }));
}

export async function createProduct(input: ProductInput) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    let slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now()}`;

    const newProduct = await prisma.product.create({
        data: {
            name: input.name,
            slug,
            description: input.description,
            base_price: input.base_price,
            sale_price: input.sale_price,
            brand_id: input.brand_id,
            is_active: input.is_active ?? true,
            is_trending: input.is_trending ?? false,
            variants: {
                create: input.variants.map(v => ({
                    size: v.size,
                    color: v.color,
                    stock_quantity: v.stock_quantity,
                    sku: v.sku
                }))
            },
            images: {
                create: input.images.map((img, idx) => ({
                    url: img.url,
                    is_primary: img.is_primary,
                    display_order: idx
                }))
            }
        }
    });

    revalidatePath("/admin");
    return {
        success: true,
        product: {
            ...newProduct,
            base_price: Number(newProduct.base_price),
            sale_price: newProduct.sale_price ? Number(newProduct.sale_price) : null
        }
    };
}

export async function updateProduct(id: string, input: ProductInput) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // We do a small trick: delete all previous variants and images, and recreate them
    // This is easier for a basic admin panel than doing deep upserts for everything,
    // though Prisma supports upsert inside update. Since orders link to variant_id, 
    // replacing variants entirely will break order_items if a variant was sold.
    // To be safe, we should use upsert for variants if they have an ID.

    const product = await prisma.product.update({
        where: { id },
        data: {
            name: input.name,
            description: input.description,
            base_price: input.base_price,
            sale_price: input.sale_price,
            brand_id: input.brand_id,
            is_active: input.is_active ?? true,
            is_trending: input.is_trending ?? false,
        }
    });

    // Handle Variants Upsert/Delete
    const dbVariants = await prisma.productVariant.findMany({ where: { product_id: id } });
    const inputVariantIds = input.variants.map(v => v.id).filter(Boolean);
    const variantsToDelete = dbVariants.filter(v => !inputVariantIds.includes(v.id)).map(v => v.id);

    if (variantsToDelete.length > 0) {
        await prisma.productVariant.deleteMany({ where: { id: { in: variantsToDelete } } });
    }

    for (const v of input.variants) {
        if (v.id) {
            await prisma.productVariant.update({
                where: { id: v.id },
                data: { size: v.size, color: v.color, stock_quantity: v.stock_quantity, sku: v.sku }
            });
        } else {
            await prisma.productVariant.create({
                data: { product_id: id, size: v.size, color: v.color, stock_quantity: v.stock_quantity, sku: v.sku }
            });
        }
    }

    // Handle Images Upsert/Delete
    const dbImages = await prisma.productImage.findMany({ where: { product_id: id } });
    const inputImageIds = input.images.map(img => img.id).filter(Boolean);
    const imagesToDelete = dbImages.filter(img => !inputImageIds.includes(img.id)).map(img => img.id);

    if (imagesToDelete.length > 0) {
        await prisma.productImage.deleteMany({ where: { id: { in: imagesToDelete } } });
    }

    for (let i = 0; i < input.images.length; i++) {
        const img = input.images[i];
        if (img.id) {
            await prisma.productImage.update({
                where: { id: img.id },
                data: { url: img.url, is_primary: img.is_primary, display_order: i }
            });
        } else {
            await prisma.productImage.create({
                data: { product_id: id, url: img.url, is_primary: img.is_primary, display_order: i }
            });
        }
    }

    revalidatePath("/admin");
    return {
        success: true,
        product: {
            ...product,
            base_price: Number(product.base_price),
            sale_price: product.sale_price ? Number(product.sale_price) : null
        }
    };
}

export async function deleteProduct(id: string) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
}
