"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

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

export async function getAdminMetrics() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // 1. Compute totals (ignoring CANCELLED/FAILED if needed, but for simplicity we'll just sum all for now or filter out CANCELLED)
    const ordersData = await prisma.order.findMany({
        where: { status: { not: "CANCELLED" } },
        include: { items: true, customer: true },
        orderBy: { created_at: 'desc' }
    });

    const totalSales = ordersData.reduce((acc, o) => acc + Number(o.total_amount), 0);
    const totalOrders = ordersData.length;
    const itemsSold = ordersData.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0);

    const uniqueCustomers = new Set(ordersData.map(o => o.customer_id)).size;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const conversionRate = 3.2; // Mocked conversion rate since we don't track session analytics

    const metrics = {
        totalSales,
        itemsSold,
        totalOrders,
        totalCustomers: uniqueCustomers,
        avgOrderValue,
        conversionRate,
    };

    // 2. Map recent orders for the table
    const recentOrders = ordersData.slice(0, 20).map(o => ({
        id: o.id.split('-')[0].toUpperCase(), // Just a short display ID
        customer: o.customer?.full_name || o.customer?.email || 'Guest',
        total: Number(o.total_amount),
        status: o.status.toLowerCase(),
        date: o.created_at.toISOString().split('T')[0],
        items: o.items.reduce((sum, item) => sum + item.quantity, 0)
    }));

    return { metrics, recentOrders };
}
