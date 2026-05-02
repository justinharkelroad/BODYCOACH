import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhotoTimeline } from './photo-timeline';
import { PhotoComparison } from '@/components/photos';
import { Camera, Plus, Images } from 'lucide-react';
import type { ProgressPhoto } from '@/types/database';
import { isNewUI } from '@/lib/feature-flags';
import { PhotosV2 } from './photos-v2';

export const dynamic = 'force-dynamic';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

export default async function PhotosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all photos
  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .order('taken_at', { ascending: false }) as { data: ProgressPhoto[] | null };

  // Generate signed URLs for each photo
  const photosWithUrls: PhotoWithUrl[] = await Promise.all(
    (photos || []).map(async (photo) => {
      const { data: urlData } = await supabase.storage
        .from('progress-photos')
        .createSignedUrl(photo.photo_url, 3600);

      return {
        ...photo,
        signedUrl: urlData?.signedUrl || null,
      };
    })
  );

  // Count by type
  const typeCounts = {
    front: photosWithUrls.filter((p) => p.photo_type === 'front').length,
    side: photosWithUrls.filter((p) => p.photo_type === 'side').length,
    back: photosWithUrls.filter((p) => p.photo_type === 'back').length,
  };

  const totalPhotos = photosWithUrls.length;

  if (isNewUI()) {
    return <PhotosV2 photos={photosWithUrls} typeCounts={typeCounts} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">Progress Photos</h1>
          <p className="text-[var(--neutral-gray)] mt-1">
            Track your visual transformation over time
          </p>
        </div>
        <Link href="/photos/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        </Link>
      </div>

      {totalPhotos === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex p-4 bg-[var(--primary-light)] rounded-full mb-4">
                <Camera className="h-12 w-12 text-[var(--primary-deep)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--neutral-dark)] mb-2">
                Start Your Visual Journey
              </h2>
              <p className="text-[var(--neutral-gray)] max-w-md mx-auto mb-6">
                Upload your first progress photo to begin tracking your transformation.
              </p>
              <Link href="/photos/upload">
                <Button>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Your First Photo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--primary-light)] rounded-[12px]">
                    <Images className="h-5 w-5 text-[var(--primary-deep)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                      {totalPhotos}
                    </p>
                    <p className="text-sm text-[var(--neutral-gray)]">Total Photos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[var(--neutral-gray)]">Front</p>
                <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                  {typeCounts.front}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[var(--neutral-gray)]">Side</p>
                <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                  {typeCounts.side}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[var(--neutral-gray)]">Back</p>
                <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                  {typeCounts.back}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Section */}
          {totalPhotos >= 2 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--neutral-dark)] mb-4">
                Before & After
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {typeCounts.front >= 2 && (
                  <PhotoComparison photos={photosWithUrls} photoType="front" />
                )}
                {typeCounts.side >= 2 && (
                  <PhotoComparison photos={photosWithUrls} photoType="side" />
                )}
                {typeCounts.back >= 2 && (
                  <PhotoComparison photos={photosWithUrls} photoType="back" />
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--neutral-dark)]">All Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoTimeline initialPhotos={photosWithUrls} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
