'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoCard } from '@/components/photos';
import type { ProgressPhoto } from '@/types/database';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

interface PhotoTimelineProps {
  initialPhotos: PhotoWithUrl[];
}

export function PhotoTimeline({ initialPhotos }: PhotoTimelineProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [filter, setFilter] = useState<'all' | 'front' | 'side' | 'back'>('all');

  const filteredPhotos =
    filter === 'all' ? photos : photos.filter((p) => p.photo_type === filter);

  async function handleDelete(photoId: string) {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/photos/upload?id=${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        router.refresh();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'front', 'side', 'back'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`
              px-4 py-2 rounded-[12px] text-sm font-medium capitalize transition-all
              ${
                filter === type
                  ? 'bg-[var(--primary-deep)] text-white'
                  : 'bg-[var(--neutral-gray-light)] text-[var(--neutral-gray)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-deep)]'
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--neutral-gray)]">
          <p>No {filter === 'all' ? '' : filter + ' view '}photos yet.</p>
        </div>
      )}
    </div>
  );
}
