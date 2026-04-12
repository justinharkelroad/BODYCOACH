'use client';

/**
 * Phase 5: Visual Guidance GIFs - GuidanceGif Component
 *
 * Displays a guidance GIF with optional caption.
 * Works on both web and can be adapted for mobile.
 */

import { useState } from 'react';
import Image from 'next/image';
import type { GuidanceGifProps } from '../types';
import { GUIDANCE_GIFS } from '../constants';

/**
 * Component to display a guidance GIF with optional caption
 *
 * @example
 * ```tsx
 * <GuidanceGif gifKey="barcodeScanning" showCaption />
 * ```
 */
export function GuidanceGif({
  gifKey,
  width = '100%',
  height = 'auto',
  showCaption = false,
  className = '',
}: GuidanceGifProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const config = GUIDANCE_GIFS[gifKey];

  if (!config) {
    console.warn(`GuidanceGif: Unknown gif key "${gifKey}"`);
    return null;
  }

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`guidance-gif ${className}`} style={{ width }}>
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className="guidance-gif__skeleton"
          style={{
            width: '100%',
            height: typeof height === 'number' ? height : 200,
            backgroundColor: 'var(--theme-neutral-light, #f3f4f6)',
            borderRadius: 12,
            animation: 'pulse 2s infinite',
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="guidance-gif__error"
          style={{
            width: '100%',
            height: typeof height === 'number' ? height : 200,
            backgroundColor: 'var(--theme-neutral-light, #f3f4f6)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-text-secondary, #6b7280)',
          }}
        >
          <span>Unable to load animation</span>
        </div>
      )}

      {/* GIF image */}
      {!hasError && (
        <div style={{ display: isLoading ? 'none' : 'block' }}>
          <Image
            src={config.uri}
            alt={config.alt || config.title}
            width={typeof width === 'number' ? width : 320}
            height={typeof height === 'number' ? height : 240}
            style={{
              width: '100%',
              height: height === 'auto' ? 'auto' : height,
              borderRadius: 12,
              objectFit: 'cover',
            }}
            onLoad={handleLoad}
            onError={handleError}
            unoptimized // GIFs should not be optimized by Next.js
          />
        </div>
      )}

      {/* Optional caption */}
      {showCaption && !hasError && (
        <div
          className="guidance-gif__caption"
          style={{
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--theme-text, #111827)',
            }}
          >
            {config.title}
          </h4>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 14,
              color: 'var(--theme-text-secondary, #6b7280)',
            }}
          >
            {config.description}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
