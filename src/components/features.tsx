"use client";

import { Truck, Globe, MapPin, ShieldCheck, Diamond } from "lucide-react";
import { motion } from "framer-motion";

export default function TrustFeatures() {
    const features = [
        {
            icon: <Globe size={40} className="text-brand-red" strokeWidth={1.5} />,
            title: "INTERNATIONAL",
            desc: "Worldwide Delivery",
        },
        {
            icon: <MapPin size={40} className="text-brand-red" strokeWidth={1.5} />,
            title: "COLOMBIA",
            desc: "Fast National Shipping",
        },
        {
            icon: <ShieldCheck size={40} className="text-brand-red" strokeWidth={1.5} />,
            title: "SECURE",
            desc: "Encrypted Payments",
        },
        {
            icon: <Diamond size={40} className="text-brand-red" strokeWidth={1.5} />,
            title: "PREMIUM",
            desc: "Highest Quality Garments",
        },
    ];

    return (
        <section className="bg-neutral-100 py-16 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8 relative z-20">
                <motion.div 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.15 } }
                    }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center md:text-left"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={{
                                hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                            }}
                            className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 group"
                        >
                            <div className="p-4 bg-white rounded-xl shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                                {feature.icon}
                            </div>
                            <div className="mt-2 md:mt-1">
                                <h4 className="font-bold text-brand-black tracking-widest text-sm mb-1">{feature.title}</h4>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
