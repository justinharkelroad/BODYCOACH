'use client';

import { useState } from 'react';
import { PhotoCard } from '@/components/photos';
import type { ProgressPhoto } from '@/types/database';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

const filterTabs = ['all', 'front', 'side', 'back'] as const;

export function AdminPhotoGrid({ photos }: { photos: PhotoWithUrl[] }) {
  const [filter, setFilter] = useState<typeof filterTabs[number]>('all');

  const filtered = filter === 'all' ? photos : photos.filter(p => p.photo_type === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors
              ${filter === tab
                ? 'bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)]'
                : 'bg-[var(--theme-bg-alt)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]'
              }
            `}
          >
            {tab} {tab !== 'all' && `(${photos.filter(p => p.photo_type === tab).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--theme-text-muted)] text-sm py-4 text-center">
          No {filter} photos.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(photo => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
}
