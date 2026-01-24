import React, { useRef, useState } from 'react';
import { PlantInfo } from '../../types';
import { identifyPlant } from '../../services/geminiService';

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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            alert("Acesso à câmera negado.");
            setScanning(false);
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
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            setLoading(true);
            onLoadingChange(true);
            try {
                const plantInfo = await identifyPlant(base64);
                onPlantIdentified(plantInfo);
                const stream = video.srcObject as MediaStream;
                stream.getTracks().forEach(t => t.stop());
                setScanning(false);
            } catch (e) {
                alert("Erro na identificação.");
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
                        className="w-48 h-48 bg-white rounded-full flex items-center justify-center mx-auto relative shadow-xl hover:shadow-orange-100 group transition-all cursor-pointer"
                    >
                        <div className="absolute inset-0 border-[3px] border-[#10b981] group-hover:border-orange-500 border-dashed rounded-full animate-[spin_20s_linear_infinite] opacity-60"></div>
                        <div className="w-40 h-40 bg-[#f0fdf4] group-hover:bg-orange-50 rounded-full flex items-center justify-center transition-colors">
                            <i className="fa-solid fa-camera text-5xl text-[#10b981] group-hover:text-orange-500"></i>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-[#1e293b]">Scanner Botânico</h2>
                        <p className="text-slate-500 text-sm px-8 leading-relaxed font-medium">
                            Capture imagens para identificar plantas e diagnosticar pragas em tempo real.
                        </p>
                    </div>
                    <button
                        onClick={startCamera}
                        className="bg-[#10b981] hover:bg-orange-500 text-white px-14 py-4 rounded-full font-bold shadow-lg transition-all active:scale-95"
                    >
                        Capturar Agora
                    </button>

                    {/* Registration Shortcut on Home/Scanner */}
                    <div className="pt-4 border-t border-slate-100 w-full">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">É um profissional ou empresa?</p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-company-form'))}
                            className="text-emerald-600 font-black text-[11px] uppercase tracking-tighter hover:text-orange-500 flex items-center justify-center gap-2 mx-auto"
                        >
                            Cadastre seu negócio aqui
                            <i className="fa-solid fa-arrow-right-long"></i>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col p-4 space-y-4">
                    <div className="relative rounded-xl overflow-hidden flex-1 bg-black shadow-inner border-4 border-white">
                        <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setScanning(false)}
                            className="bg-white text-slate-400 h-16 w-16 rounded-xl border border-slate-200 shadow-sm"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                        <button
                            onClick={captureAndIdentify}
                            className="flex-1 bg-[#10b981] hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl"
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
