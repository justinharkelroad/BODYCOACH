'use client';

/**
 * Phase 5: Visual Guidance GIFs - ContextualTooltip Component
 *
 * Modal overlay for first-time feature guidance.
 * Shows a GIF with explanation and dismiss button.
 */

import { useEffect, useRef } from 'react';
import type { ContextualTooltipProps } from '../types';
import { GUIDANCE_GIFS } from '../constants';
import { GuidanceGif } from './GuidanceGif';

/**
 * Modal overlay showing a contextual guidance tip
 *
 * @example
 * ```tsx
 * <ContextualTooltip
 *   gifKey="quickLog"
 *   visible={showTip}
 *   onDismiss={() => setShowTip(false)}
 * />
 * ```
 */
export function ContextualTooltip({
  gifKey,
  visible,
  onDismiss,
  title,
  description,
}: ContextualTooltipProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const config = GUIDANCE_GIFS[gifKey];

  // Close on escape key
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onDismiss]);

  // Close on overlay click (not card click)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onDismiss();
    }
  };

  if (!visible || !config) return null;

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      ref={overlayRef}
      className="contextual-tooltip__overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="contextual-tooltip__card"
        style={{
          width: '90%',
          maxWidth: 360,
          backgroundColor: 'var(--theme-surface, #ffffff)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* GIF */}
        <div
          style={{
            backgroundColor: 'var(--theme-neutral-light, #f9fafb)',
            padding: 16,
          }}
        >
          <GuidanceGif gifKey={gifKey} height={200} />
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--theme-text, #111827)',
              textAlign: 'center',
            }}
          >
            {displayTitle}
          </h3>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 15,
              lineHeight: 1.5,
              color: 'var(--theme-text-secondary, #6b7280)',
              textAlign: 'center',
            }}
          >
            {displayDescription}
          </p>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 20,
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--theme-text-on-primary, #ffffff)',
              backgroundColor: 'var(--theme-primary, #7c3aed)',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'transform 0.1s, opacity 0.1s',
            }}
            onMouseDown={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            Got it!
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
