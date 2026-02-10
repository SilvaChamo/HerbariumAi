import React, { useRef, useState } from 'react';
import { PlantInfo } from '../../types';
import { identifyPlant } from '../../services/geminiService';
import { formatCurrency, compressImage } from '../../utils';

interface ScannerProps {
    onPlantIdentified: (plant: PlantInfo) => void;
    onLoadingChange: (loading: boolean) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onPlantIdentified, onLoadingChange }) => {
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
            setScanning(true);
            // Flexible constraints for wider compatibility
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for metadata to load before playing
                videoRef.current.onloadedmetadata = async () => {
                    try {
                        if (videoRef.current) {
                            await videoRef.current.play();
                        }
                    } catch (playErr) {
                        console.error("Video play failed:", playErr);
                    }
                };
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            // Fallback for devices that might not support specific constraints
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                }
            } catch (fallbackErr) {
                alert(`Acesso à câmera negado: ${err.message || 'Erro desconhecido'}`);
                setScanning(false);
            }
        }
    };

    const captureAndIdentify = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);

            setLoading(true);
            onLoadingChange(true);

            try {
                // Convert canvas to blob first
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
                });

                // Use compressImage to ensure it's WebP and under 100kb
                const compressedWebpBlob = await compressImage(blob, { targetSizeKb: 100 });

                // Convert compressed blob to base64 for Gemini
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                    };
                });
                reader.readAsDataURL(compressedWebpBlob);
                const base64 = await base64Promise;

                const plantInfo = await identifyPlant(base64);
                onPlantIdentified(plantInfo);

                // Stop all tracks
                const stream = video.srcObject as MediaStream;
                if (stream) {
                    stream.getTracks().forEach(t => t.stop());
                }
                setScanning(false);
            } catch (e: any) {
                console.error("Identification error:", e);
                alert(`Erro na identificação: ${e.message || 'Erro de processamento'}`);
            } finally {
                setLoading(false);
                onLoadingChange(false);
            }
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            {!scanning ? (
                <div className="space-y-10 animate-in fade-in zoom-in w-full">
                    <div
                        onClick={startCamera}
                        className="w-48 h-48 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto relative shadow-xl hover:shadow-orange-100 dark:hover:shadow-none dark:shadow-none group transition-all cursor-pointer"
                    >
                        <div className="absolute inset-0 border-[3px] border-[#10b981] group-hover:border-orange-500 border-dashed rounded-full animate-[spin_20s_linear_infinite] opacity-60"></div>
                        <div className="w-40 h-40 bg-[#f0fdf4] dark:bg-emerald-900/20 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 rounded-full flex items-center justify-center transition-colors">
                            <i className="fa-solid fa-camera text-5xl text-[#10b981] group-hover:text-orange-500"></i>
                        </div>
                    </div>
                    <div className="space-y-0">
                        <h2 className="text-xl font-extrabold text-[#1e293b] dark:text-slate-100">Scanner Botânico</h2>
                        <p className="text-slate-500 dark:text-slate-200 text-xs px-6 leading-tight font-medium">
                            Capture imagens para identificar plantas e diagnosticar pragas em tempo real.
                        </p>
                    </div>
                    <button
                        onClick={startCamera}
                        className="mt-5 bg-[#10b981] hover:bg-orange-500 text-white px-14 py-3 rounded-full font-bold shadow-lg dark:shadow-none transition-all active:scale-95"
                    >
                        Capturar Agora
                    </button>

                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-company-form'))}
                        className="text-emerald-600 font-black text-[11px] uppercase tracking-tighter hover:text-orange-500 flex items-center justify-center gap-2 mx-auto"
                    >
                        Cadastre seu negócio aqui
                        <i className="fa-solid fa-arrow-right-long"></i>
                    </button>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col p-4 space-y-4">
                    <div className="relative rounded-[8px] overflow-hidden flex-1 bg-black shadow-inner border-4 border-white">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setScanning(false)}
                            className="bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 h-16 w-16 rounded-[8px] border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                        <button
                            onClick={captureAndIdentify}
                            className="flex-1 bg-[#10b981] hover:bg-orange-500 text-white py-4 rounded-[8px] font-bold text-lg shadow-xl dark:shadow-none"
                        >
                            {loading ? 'Analisando...' : 'Capturar'}
                        </button>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default Scanner;
