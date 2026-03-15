"use client";

import { Truck, Globe, MapPin, ShieldCheck, Diamond } from "lucide-react";

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
        <section className="bg-brand-bg py-16 relative overflow-hidden">
            {/* Top fade from Reels section */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-brand-black to-transparent z-10 pointer-events-none" />
            {/* Bottom fade into Footer */}
            <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-brand-black to-transparent z-10 pointer-events-none" />
            <div className="container mx-auto px-4 md:px-8 relative z-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 group"
                        >
                            <div className="p-4 bg-white rounded-xl shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                                {feature.icon}
                            </div>
                            <div className="mt-2 md:mt-1">
                                <h4 className="font-bold text-brand-black tracking-widest text-sm mb-1">{feature.title}</h4>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
