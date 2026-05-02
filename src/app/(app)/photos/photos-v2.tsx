import Link from 'next/link';
import { Camera, Images, Plus } from 'lucide-react';
import { KPICard, PageHeader } from '@/components/v2';
import { PhotoTimeline } from './photo-timeline';
import { PhotoComparison } from '@/components/photos';
import type { ProgressPhoto } from '@/types/database';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

interface PhotosV2Props {
  photos: PhotoWithUrl[];
  typeCounts: { front: number; side: number; back: number };
}

export function PhotosV2({ photos, typeCounts }: PhotosV2Props) {
  const total = photos.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress Photos"
        subtitle="Track your visual transformation over time"
        action={
          <Link
            href="/photos/upload"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-4 py-2 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Upload
          </Link>
        }
      />

      {total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KPICard
              label="Total Photos"
              icon={<Images className="h-4 w-4" />}
              tone="blue"
              value={String(total)}
              unit="photos"
            />
            <KPICard
              label="Front"
              icon={<Camera className="h-4 w-4" />}
              tone="pink"
              value={String(typeCounts.front)}
            />
            <KPICard
              label="Side"
              icon={<Camera className="h-4 w-4" />}
              tone="coral"
              value={String(typeCounts.side)}
            />
            <KPICard
              label="Back"
              icon={<Camera className="h-4 w-4" />}
              tone="gold"
              value={String(typeCounts.back)}
            />
          </div>

          {total >= 2 && (
            <div>
              <h2 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
                Before & After
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {typeCounts.front >= 2 && (
                  <div className="rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
                    <PhotoComparison photos={photos} photoType="front" />
                  </div>
                )}
                {typeCounts.side >= 2 && (
                  <div className="rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
                    <PhotoComparison photos={photos} photoType="side" />
                  </div>
                )}
                {typeCounts.back >= 2 && (
                  <div className="rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
                    <PhotoComparison photos={photos} photoType="back" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
            <h3 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
              All Photos
            </h3>
            <PhotoTimeline initialPhotos={photos} />
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl bg-white/95 px-6 py-16 text-center shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5F2FF]">
        <Camera className="h-8 w-8 text-[#3B9DFF]" />
      </div>
      <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
        Start Your Visual Journey
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-[13px] text-[#6e6e73]">
        Upload your first progress photo to begin tracking your transformation.
      </p>
      <Link
        href="/photos/upload"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg"
      >
        <Camera className="h-4 w-4" />
        Upload Your First Photo
      </Link>
    </div>
  );
}
