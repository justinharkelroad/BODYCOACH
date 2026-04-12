import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiPhotoUpload } from '@/components/photos';
import { ArrowLeft, Lightbulb } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PhotoUploadPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/photos"
        className="inline-flex items-center gap-2 text-[var(--neutral-gray)] hover:text-[var(--neutral-dark)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Photos
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">
          Upload Progress Photos
        </h1>
        <p className="text-[var(--neutral-gray)] mt-1">
          Capture all angles to track your complete transformation
        </p>
      </div>

      {/* Tips */}
      <div className="bg-[var(--primary-light)] rounded-[16px] p-5">
        <div className="flex gap-3">
          <Lightbulb className="h-5 w-5 text-[var(--primary-deep)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--primary-deep)] mb-2">Tips for great progress photos</p>
            <ul className="text-sm text-[var(--neutral-dark)] space-y-1">
              <li>• Use consistent lighting and background</li>
              <li>• Take photos at the same time of day</li>
              <li>• Wear similar clothing for accurate comparison</li>
              <li>• Relax your muscles for baseline photos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Multi-Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--neutral-dark)]">Add Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiPhotoUpload />
        </CardContent>
      </Card>
    </div>
  );
}
