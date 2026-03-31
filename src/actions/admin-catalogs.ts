"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const profile = await prisma.customerProfile.findUnique({
        where: { id: user.id }
    });
    
    return profile?.role === "ADMIN";
}

export async function getBrands() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");
    return prisma.brand.findMany({ orderBy: { name: 'asc' } });
}

export async function createBrand(name: string) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if brand exists
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) return existing;

    return prisma.brand.create({ data: { name, slug } });
}

export async function getCategories() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(name: string) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return existing;

    return prisma.category.create({ data: { name, slug } });
}
