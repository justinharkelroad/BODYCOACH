import { createClientForApi } from '@/lib/supabase/server';
import { analyzeProgressPhoto } from '@/lib/ai/client';
import { NextRequest, NextResponse } from 'next/server';
import type { ProgressPhoto } from '@/types/database';

export async function POST(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: 'photoId is required' }, { status: 400 });
    }

    // Get the photo record
    const { data: photo, error: photoError } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single() as { data: ProgressPhoto | null; error: unknown };

    if (photoError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Get user's profile for goal context
    const { data: profile } = await supabase
      .from('profiles')
      .select('goal')
      .eq('id', user.id)
      .single();

    // Find previous photo of same type for comparison
    const { data: previousPhotos } = await supabase
      .from('progress_photos')
      .select('ai_analysis')
      .eq('user_id', user.id)
      .eq('photo_type', photo.photo_type)
      .lt('taken_at', photo.taken_at)
      .order('taken_at', { ascending: false })
      .limit(1) as { data: ProgressPhoto[] | null };

    const previousAnalysis = previousPhotos?.[0]?.ai_analysis || null;

    // Download the photo from storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('progress-photos')
      .download(photo.photo_url);

    if (downloadError || !imageData) {
      console.error('Failed to download photo:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download photo for analysis' },
        { status: 500 }
      );
    }

    // Convert to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Determine media type
    const mediaType = imageData.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

    // Analyze with Claude Vision
    const analysis = await analyzeProgressPhoto(base64, mediaType, {
      goal: profile?.goal || 'gain_muscle',
      photoType: photo.photo_type as 'front' | 'side' | 'back',
      previousAnalysis,
    });

    // Store analysis results
    const { data: updatedPhoto, error: updateError } = await supabase
      .from('progress_photos')
      .update({ ai_analysis: analysis })
      .eq('id', photoId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to save analysis:', updateError);
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      );
    }

    // Get signed URL for the photo
    const { data: urlData } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(photo.photo_url, 3600);

    return NextResponse.json({
      photo: {
        ...updatedPhoto,
        signedUrl: urlData?.signedUrl,
      },
      analysis,
    });
  } catch (error) {
    console.error('Photo analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
