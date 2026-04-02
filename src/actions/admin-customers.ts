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

export async function getAdminCustomers() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // Fetch all customers that have orders, including all their orders
    const customers = await prisma.customerProfile.findMany({
        where: {
            orders: { some: {} } // only customers who have placed at least one order
        },
        include: {
            orders: {
                orderBy: { created_at: 'desc' },
                include: {
                    items: {
                        include: { variant: { include: { product: true } } }
                    }
                }
            }
        }
    });

    // Compute total spend and map for the UI
    const mappedCustomers = customers.map(c => {
        const validOrders = c.orders.filter(o => o.status !== "CANCELLED");
        const totalSpent = validOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);

        return {
            id: c.id,
            email: c.email,
            name: c.full_name || "Guest",
            phone: c.phone || "---",
            totalSpent,
            orderCount: c.orders.length,
            orders: c.orders.map(o => ({
                id: o.id,
                short_id: o.id.split('-').slice(-1)[0],
                total: Number(o.total_amount),
                status: o.status,
                paymentStatus: o.payment_status,
                date: o.created_at.toISOString().split('T')[0],
                items: o.items.map(item => ({
                    qty: item.quantity,
                    product: item.variant.product.name,
                    size: item.variant.size
                }))
            }))
        };
    });

    // Sort by total spent descending
    mappedCustomers.sort((a, b) => b.totalSpent - a.totalSpent);

    return mappedCustomers;
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(newStatus)) throw new Error("Invalid status");

    const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus as any }
    });

    revalidatePath("/admin");
    return { success: true };
}
