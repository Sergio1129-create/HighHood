"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { uploadAdminImage } from "@/actions/admin-storage";

interface ImageUploaderProps {
    value?: string;
    onUploadSuccess: (url: string) => void;
    onClear?: () => void;
    className?: string;
    placeholder?: string;
}

export function ImageUploader({ value, onUploadSuccess, onClear, className = "", placeholder }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await processFile(file);
        // Reset input to allow selecting same file again if aborted
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) await processFile(file);
    };

    const processFile = async (file: File) => {
        setError(null);
        if (!file.type.startsWith("image/")) {
            setError("Solo se permiten archivos de imagen");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen no debe pesar más de 5MB");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadAdminImage(formData);
        
        setIsUploading(false);
        if (res.error) {
            setError(res.error);
        } else if (res.url) {
            onUploadSuccess(res.url);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {value ? (
                <div className="relative w-full aspect-video sm:aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/50 group flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Preview" className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 backdrop-blur-sm p-2">
                        <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg backdrop-blur text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            <UploadCloud size={14}/> Cambiar
                        </button>
                        {onClear && (
                            <button 
                                type="button" 
                                onClick={(e) => { e.preventDefault(); onClear(); }}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-500 px-3 py-1.5 rounded-lg backdrop-blur text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <X size={14} /> Quitar
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                        w-full aspect-video sm:aspect-auto sm:h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all text-center
                        ${isDragging ? 'border-brand-red bg-brand-red/10' : 'border-white/10 hover:border-white/30 bg-black/20 hover:bg-black/40'}
                        ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                    `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-6 h-6 text-brand-red animate-spin mb-2" />
                            <p className="text-xs text-white/70">Subiendo...</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-brand-red scale-110' : 'text-white/40'} transition-all`} />
                            <p className="text-xs text-white/80 font-medium">{placeholder || "Toca o arrastra una imagen"}</p>
                            <p className="text-[10px] text-neutral-500 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                        </>
                    )}
                </div>
            )}
            {error && (
                <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={10} /> {error}</p>
            )}
            <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect} 
            />
        </div>
    );
}
