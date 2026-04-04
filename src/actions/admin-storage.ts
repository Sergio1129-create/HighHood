"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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

export async function uploadAdminImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) throw new Error("Unauthorized");

        const file = formData.get("file") as File;
        if (!file) throw new Error("No file uploaded");

        // Basic verification
        if (!file.type.startsWith("image/")) {
            throw new Error("Invalid file type. Only images are allowed.");
        }
        
        // 5MB max
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File too large. Maximum size is 5MB.");
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Clean filename, secure collision
        const ext = file.name.split('.').pop() || 'png';
        const uniqueSuffix = crypto.randomBytes(6).toString('hex');
        const filename = `${uniqueSuffix}-${Date.now()}.${ext}`;

        const supabase = await createClient();

        // 1. Upload to bucket
        const { data, error } = await supabase.storage
            .from("highhood-assets")
            .upload(`uploads/${filename}`, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error("Supabase Storage Error:", error);
            throw new Error(error.message);
        }

        // 2. Retrieve Public URL
        const { data: publicUrlData } = supabase.storage
            .from("highhood-assets")
            .getPublicUrl(data.path);

        return { success: true, url: publicUrlData.publicUrl };
    } catch (e: any) {
        console.error("Storage upload error:", e);
        return { success: false, error: e.message };
    }
}
