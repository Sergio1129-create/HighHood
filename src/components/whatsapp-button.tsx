"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsappButton() {
    return (
        <motion.a
            href="https://wa.me/573214085305"
            target="_blank"
            rel="noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[160] bg-[#25D366] text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-[#1ebd5a] transition-colors group"
            aria-label="Chat with us on WhatsApp"
        >
            <MessageCircle size={32} />

            {/* Tooltip */}
            <span className="absolute right-full mr-4 bg-white text-brand-black px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest shadow-xl pointer-events-none">
                Need help? Chat with us!
                {/* Little triangle pointer */}
                <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45" />
            </span>
        </motion.a>
    );
}
