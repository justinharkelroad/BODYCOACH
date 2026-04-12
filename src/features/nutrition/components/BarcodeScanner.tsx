'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Camera, FlashlightOff, Flashlight, AlertCircle } from 'lucide-react';
import { useBarcodeScanner, isValidBarcode } from '../hooks/useBarcodeScanner';
import type { NormalizedFood } from '../types/nutrition.types';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (food: NormalizedFood, barcode: string) => void;
  onNotFound: (barcode: string) => void;
}

export function BarcodeScanner({
  isOpen,
  onClose,
  onFoodFound,
  onNotFound
}: BarcodeScannerProps) {
  const { isLoading, result, error, processBarcode, reset } = useBarcodeScanner();
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      reset();
      setManualBarcode('');
      setShowManualInput(false);
      setCameraError(null);
    }

    return () => stopCamera();
  }, [isOpen, reset]);

  // Handle result
  useEffect(() => {
    if (result) {
      if (result.food) {
        // Vibrate on success (if supported)
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        onFoodFound(result.food, result.barcode);
        onClose();
      } else if (result.source === 'not_found') {
        onNotFound(result.barcode);
        onClose();
      }
    }
  }, [result, onFoodFound, onNotFound, onClose]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please use manual entry.');
      setShowManualInput(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleManualSubmit = async () => {
    const trimmed = manualBarcode.trim();
    if (!isValidBarcode(trimmed)) {
      return;
    }
    await processBarcode(trimmed);
  };

  // Note: Real barcode scanning would use a library like @aspect/barcode-reader
  // or react-qr-barcode-scanner. This is a placeholder UI.
  const handleSimulatedScan = async (barcode: string) => {
    await processBarcode(barcode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[var(--theme-overlay-scrim)]">
        <button onClick={onClose} className="text-white p-2">
          <X size={24} />
        </button>
        <span className="text-white font-medium">Scan Barcode</span>
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-white text-sm px-3 py-1 bg-white/20 rounded-full"
        >
          Manual
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white text-center">
            <AlertCircle size={48} className="mb-4 text-yellow-400" />
            <p>{cameraError}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanning frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-32 border-2 border-white rounded-lg relative">
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br" />

                {/* Scanning line animation */}
                {!isLoading && (
                  <div className="absolute inset-x-2 h-0.5 bg-orange-500 animate-scan" />
                )}
              </div>
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-[var(--theme-overlay-scrim)] flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>Looking up barcode...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual input */}
      {showManualInput && (
        <div className="p-4 bg-zinc-900">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter barcode number"
              className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={14}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!isValidBarcode(manualBarcode) || isLoading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </div>
          {manualBarcode && !isValidBarcode(manualBarcode) && (
            <p className="text-yellow-400 text-sm mt-2">
              Enter a valid barcode (8, 12, or 13 digits)
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500/20 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-black text-white text-center text-sm">
        <p>Position the barcode within the frame</p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            top: 0.5rem;
          }
          50% {
            top: calc(100% - 0.5rem);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Barcode entry result modal - shown when barcode not found
 */
interface BarcodeNotFoundModalProps {
  isOpen: boolean;
  barcode: string;
  onClose: () => void;
  onCreateFood: (barcode: string) => void;
}

export function BarcodeNotFoundModal({
  isOpen,
  barcode,
  onClose,
  onCreateFood
}: BarcodeNotFoundModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[var(--theme-overlay-scrim)] flex items-center justify-center p-4">
      <div className="bg-[var(--theme-surface)] dark:bg-zinc-900 rounded-xl p-6 max-w-sm w-full">
        <div className="text-center mb-4">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-2" />
          <h3 className="text-lg font-semibold">Product Not Found</h3>
          <p className="text-sm text-zinc-500 mt-1">
            No nutrition data found for barcode:
          </p>
          <p className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded mt-2 inline-block">
            {barcode}
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onCreateFood(barcode)}
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium"
          >
            Add Manually
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
