'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Sparkles, Trash2, Calendar, CheckCircle2, TrendingUp, Target, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ProgressPhoto } from '@/types/database';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

interface PhotoCardProps {
  photo: PhotoWithUrl;
  onAnalyze?: (photoId: string) => void;
  onDelete?: (photoId: string) => void;
  isAnalyzing?: boolean;
  analysisJustCompleted?: boolean;
}

export function PhotoCard({ photo, onAnalyze, onDelete, isAnalyzing, analysisJustCompleted }: PhotoCardProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Auto-show analysis when it just completed
  useEffect(() => {
    if (analysisJustCompleted && photo.ai_analysis) {
      setShowFullAnalysis(true);
    }
  }, [analysisJustCompleted, photo.ai_analysis]);

  // Parse analysis - handle both proper objects and raw JSON strings stored in DB
  const parseAnalysis = () => {
    if (!photo.ai_analysis) return null;

    let data = photo.ai_analysis;

    // If it's stored as a string in JSONB, it comes back as a string
    if (typeof data === 'string') {
      try {
        // Remove markdown code blocks if present
        let text = data as string;
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          text = codeBlockMatch[1].trim();
        }
        data = JSON.parse(text);
      } catch {
        return null;
      }
    }

    // Check if it's a valid analysis object
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;

      // Check if summary itself contains JSON (double-encoded issue)
      if (typeof obj.summary === 'string' && obj.summary.includes('```json')) {
        try {
          const innerMatch = (obj.summary as string).match(/```(?:json)?\s*([\s\S]*?)```/);
          if (innerMatch) {
            return JSON.parse(innerMatch[1].trim());
          }
        } catch {
          // Continue with existing data
        }
      }

      // Check if summary looks like raw JSON
      if (typeof obj.summary === 'string' && obj.summary.trim().startsWith('{')) {
        try {
          return JSON.parse(obj.summary);
        } catch {
          // Continue with existing data
        }
      }

      // If summary starts with backticks, the whole thing is bad data
      if (typeof obj.summary === 'string' && obj.summary.includes('`json')) {
        return null; // Force re-analysis
      }

      return {
        summary: obj.summary as string | undefined,
        observations: obj.observations as string[] | undefined,
        improvements: obj.improvements as string[] | undefined,
        focusAreas: obj.focusAreas as string[] | undefined,
        comparisonNotes: obj.comparisonNotes as string | undefined,
      };
    }

    return null;
  };

  const analysis = parseAnalysis();

  const photoTypeLabels: Record<string, string> = {
    front: 'Front View',
    side: 'Side View',
    back: 'Back View',
  };

  const hasAnalysis = analysis && (analysis.summary || analysis.observations?.length);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-[3/4] bg-[var(--neutral-gray-light)]">
          {photo.signedUrl ? (
            <Image
              src={photo.signedUrl}
              alt={`Progress photo - ${photo.photo_type}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Camera className="h-12 w-12 text-[var(--neutral-gray)]" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-[var(--neutral-dark)]">
              {photoTypeLabels[photo.photo_type] || photo.photo_type}
            </span>
          </div>
          {hasAnalysis && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--success)] text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Analyzed
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--neutral-gray)]">
              <Calendar className="h-4 w-4" />
              {new Date(photo.taken_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(photo.id)}
                className="p-2 text-[var(--neutral-gray)] hover:text-[var(--accent-coral)] hover:bg-[rgba(255,107,107,0.1)] rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Analysis Section */}
          {isAnalyzing ? (
            <div className="bg-[var(--primary-light)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="h-5 w-5 text-[var(--primary-deep)] animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-[var(--primary-deep)]">Analyzing photo...</p>
                  <p className="text-xs text-[var(--neutral-gray)]">This takes about 15-20 seconds</p>
                </div>
              </div>
            </div>
          ) : hasAnalysis ? (
            <div className="space-y-3">
              {/* Summary Preview */}
              <div className="bg-[var(--neutral-gray-light)] rounded-xl p-4">
                <p className="text-sm text-[var(--neutral-dark)] line-clamp-2">
                  {analysis.summary}
                </p>
              </div>

              {/* View Full Analysis Button */}
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setShowFullAnalysis(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Analysis
              </Button>
            </div>
          ) : onAnalyze ? (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => onAnalyze(photo.id)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze with AI
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {/* Full Analysis Modal */}
      {showFullAnalysis && analysis && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullAnalysis(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[rgba(184,169,232,0.1)] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--primary-light)] rounded-xl">
                  <Sparkles className="h-5 w-5 text-[var(--primary-deep)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--neutral-dark)]">AI Analysis</h3>
                  <p className="text-xs text-[var(--neutral-gray)]">
                    {photoTypeLabels[photo.photo_type]} • {new Date(photo.taken_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullAnalysis(false)}
                className="p-2 hover:bg-[var(--neutral-gray-light)] rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 text-[var(--neutral-gray)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-6">
              {/* Summary */}
              {analysis.summary && (
                <div>
                  <p className="text-[var(--neutral-dark)] leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              )}

              {/* Observations */}
              {analysis.observations && analysis.observations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-[var(--primary-deep)]" />
                    <h4 className="font-semibold text-[var(--neutral-dark)]">Observations</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.observations.map((obs: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-[var(--neutral-dark)]">
                        <span className="text-[var(--primary-deep)] mt-1">•</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {analysis.improvements && analysis.improvements.length > 0 && (
                <div className="bg-[rgba(52,199,89,0.08)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-[var(--success)]" />
                    <h4 className="font-semibold text-[var(--success)]">Improvements</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.improvements.map((imp: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-[var(--neutral-dark)]">
                        <CheckCircle2 className="h-4 w-4 text-[var(--success)] mt-0.5 flex-shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Focus Areas */}
              {analysis.focusAreas && analysis.focusAreas.length > 0 && (
                <div className="bg-[var(--primary-light)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-[var(--primary-deep)]" />
                    <h4 className="font-semibold text-[var(--primary-deep)]">Focus Areas</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.focusAreas.map((area: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-[var(--neutral-dark)]">
                        <span className="text-[var(--primary-deep)]">→</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comparison Notes */}
              {analysis.comparisonNotes && (
                <div className="border-t border-[rgba(184,169,232,0.1)] pt-4">
                  <p className="text-sm italic text-[var(--neutral-gray)]">
                    {analysis.comparisonNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[rgba(184,169,232,0.1)] p-4">
              <Button
                className="w-full"
                onClick={() => setShowFullAnalysis(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
