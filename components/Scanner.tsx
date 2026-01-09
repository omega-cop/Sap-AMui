import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { identifyProduct } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { Product } from '../types';

export const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ product: Product | null, reason?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể truy cập camera. Vui lòng cấp quyền.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    setScanResult(null);

    // 1. Capture frame
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

    // 2. Get local products for context
    const products = StorageService.getProducts();

    // 3. Call AI
    const result = await identifyProduct(imageBase64, products);

    // 4. Process Result
    if (result.matchedProductId) {
      const foundProduct = products.find(p => p.id === result.matchedProductId);
      setScanResult({ product: foundProduct || null, reason: result.reason });
    } else {
      setScanResult({ product: null, reason: result.reason || "Không tìm thấy sản phẩm trong kho." });
    }

    setIsScanning(false);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      {/* Camera Feed */}
      <div className="flex-1 relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
          onLoadedMetadata={() => videoRef.current?.play()}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay Result */}
        {scanResult && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in z-20">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              {scanResult.product ? (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{scanResult.product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 uppercase tracking-wide font-semibold">{scanResult.product.brand}</p>
                  <div className="text-3xl font-bold text-brand-600 mb-4">{formatCurrency(scanResult.product.price)}</div>
                  <Button fullWidth onClick={() => setScanResult(null)}>Quét tiếp</Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy</h3>
                  <p className="text-gray-600 mb-6">{scanResult.reason}</p>
                  <Button variant="secondary" fullWidth onClick={() => setScanResult(null)}>Thử lại</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Permissions Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-4 text-center">
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Control Area */}
      <div className="bg-white p-6 pb-24 rounded-t-3xl -mt-6 z-10 shadow-up">
        <div className="flex flex-col items-center">
          <p className="text-gray-500 mb-4 text-sm font-medium">Hướng camera vào sản phẩm</p>
          <button 
            onClick={handleScan}
            disabled={!isStreamActive || isScanning}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg transition-transform active:scale-95
              ${isScanning 
                ? 'bg-gray-100 border-gray-300 animate-pulse' 
                : 'bg-brand-600 border-brand-200 hover:bg-brand-700'
              }
            `}
          >
            {isScanning ? (
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Zap className="w-8 h-8 text-white fill-current" />
            )}
          </button>
          <span className="mt-3 font-bold text-brand-900">
            {isScanning ? 'Đang AI Phân tích...' : 'QUÉT AI'}
          </span>
        </div>
      </div>
    </div>
  );
};
