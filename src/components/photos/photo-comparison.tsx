'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, ArrowRight, Calendar } from 'lucide-react';
import type { ProgressPhoto } from '@/types/database';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

interface PhotoComparisonProps {
  photos: PhotoWithUrl[];
  photoType: 'front' | 'side' | 'back';
}

export function PhotoComparison({ photos, photoType }: PhotoComparisonProps) {
  // Sort by date ascending
  const sortedPhotos = [...photos]
    .filter((p) => p.photo_type === photoType)
    .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());

  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(sortedPhotos.length - 1);

  if (sortedPhotos.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--neutral-dark)] capitalize">
            {photoType} View Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[var(--neutral-gray)]">
            <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Upload at least 2 {photoType} view photos to compare progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const beforePhoto = sortedPhotos[beforeIndex];
  const afterPhoto = sortedPhotos[afterIndex];

  const daysBetween = Math.round(
    (new Date(afterPhoto.taken_at).getTime() - new Date(beforePhoto.taken_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[var(--neutral-dark)] capitalize">
            {photoType} View Comparison
          </CardTitle>
          <span className="text-sm text-[var(--primary-deep)] font-medium">
            {daysBetween} days apart
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--neutral-gray)]">Before</span>
              <span className="text-xs text-[var(--neutral-gray)] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(beforePhoto.taken_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="relative aspect-[3/4] bg-[var(--neutral-gray-light)] rounded-[12px] overflow-hidden">
              {beforePhoto.signedUrl ? (
                <Image
                  src={beforePhoto.signedUrl}
                  alt="Before"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Camera className="h-8 w-8 text-[var(--neutral-gray)]" />
                </div>
              )}
            </div>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--neutral-gray)]">After</span>
              <span className="text-xs text-[var(--neutral-gray)] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(afterPhoto.taken_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="relative aspect-[3/4] bg-[var(--neutral-gray-light)] rounded-[12px] overflow-hidden">
              {afterPhoto.signedUrl ? (
                <Image
                  src={afterPhoto.signedUrl}
                  alt="After"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Camera className="h-8 w-8 text-[var(--neutral-gray)]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Selectors */}
        {sortedPhotos.length > 2 && (
          <div className="flex items-center gap-4 pt-4 border-t border-[rgba(184,169,232,0.1)]">
            <div className="flex-1">
              <label className="text-xs text-[var(--neutral-gray)] mb-1 block">Before</label>
              <select
                value={beforeIndex}
                onChange={(e) => setBeforeIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[8px] border border-[rgba(184,169,232,0.2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-deep)]"
              >
                {sortedPhotos.map((photo, index) => (
                  <option key={photo.id} value={index} disabled={index >= afterIndex}>
                    {new Date(photo.taken_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="h-5 w-5 text-[var(--neutral-gray)] flex-shrink-0 mt-5" />

            <div className="flex-1">
              <label className="text-xs text-[var(--neutral-gray)] mb-1 block">After</label>
              <select
                value={afterIndex}
                onChange={(e) => setAfterIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[8px] border border-[rgba(184,169,232,0.2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-deep)]"
              >
                {sortedPhotos.map((photo, index) => (
                  <option key={photo.id} value={index} disabled={index <= beforeIndex}>
                    {new Date(photo.taken_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
