'use client';

/**
 * Phase 5: Visual Guidance GIFs - PortionGuideCard Component
 *
 * Expandable card showing all 3 portion guide GIFs.
 * Used in food detail screens to help users estimate servings.
 */

import { useState } from 'react';
import type { PortionGuideCardProps } from '../types';
import { GUIDANCE_GIFS, PORTION_GUIDE_ITEMS } from '../constants';
import { GuidanceGif } from './GuidanceGif';

/**
 * Expandable card with portion size guides (palm, fist, thumb)
 *
 * @example
 * ```tsx
 * <PortionGuideCard defaultExpanded={false} />
 * ```
 */
export function PortionGuideCard({
  defaultExpanded = false,
  className = '',
}: PortionGuideCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'protein' | 'carbs' | 'fats'>('protein');

  const activeItem = PORTION_GUIDE_ITEMS.find((item) => item.macro === activeTab);
  const activeConfig = activeItem ? GUIDANCE_GIFS[activeItem.key] : null;

  return (
    <div
      className={`portion-guide-card ${className}`}
      style={{
        backgroundColor: 'var(--theme-surface, #ffffff)',
        borderRadius: 16,
        border: '1px solid var(--theme-border, #e5e7eb)',
        overflow: 'hidden',
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🤚</span>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--theme-text, #111827)',
              }}
            >
              Portion Size Guide
            </h4>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 13,
                color: 'var(--theme-text-secondary, #6b7280)',
              }}
            >
              Use your hand to estimate servings
            </p>
          </div>
        </div>

        {/* Expand/collapse icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--theme-text-secondary, #6b7280)',
          }}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expandable content */}
      <div
        style={{
          maxHeight: isExpanded ? 500 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          style={{
            padding: '0 20px 20px',
            borderTop: '1px solid var(--theme-border, #e5e7eb)',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '16px 0',
            }}
          >
            {PORTION_GUIDE_ITEMS.map((item) => (
              <button
                key={item.macro}
                onClick={() => setActiveTab(item.macro)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 12px',
                  fontSize: 14,
                  fontWeight: 500,
                  color:
                    activeTab === item.macro
                      ? 'var(--theme-text-on-primary, #ffffff)'
                      : 'var(--theme-text-secondary, #6b7280)',
                  backgroundColor:
                    activeTab === item.macro
                      ? 'var(--theme-primary, #7c3aed)'
                      : 'var(--theme-neutral-light, #f3f4f6)',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                <span>{item.emoji}</span>
                <span>{item.macro}</span>
              </button>
            ))}
          </div>

          {/* Active GIF */}
          {activeItem && activeConfig && (
            <div>
              <div
                style={{
                  backgroundColor: 'var(--theme-neutral-light, #f9fafb)',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <GuidanceGif gifKey={activeItem.key} height={180} />
              </div>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    backgroundColor: 'var(--theme-primary-light, #ede9fe)',
                    borderRadius: 20,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{activeItem.emoji}</span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--theme-primary, #7c3aed)',
                    }}
                  >
                    {activeItem.bodyPart} = 1 serving of {activeItem.macro}
                  </span>
                </div>
                <p
                  style={{
                    margin: '12px 0 0',
                    fontSize: 14,
                    color: 'var(--theme-text-secondary, #6b7280)',
                    lineHeight: 1.5,
                  }}
                >
                  {activeConfig.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
