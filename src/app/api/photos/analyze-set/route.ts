import { createClientForApi } from '@/lib/supabase/server';
import { analyzeProgressPhotoSet, PhotoSetAnalysisResult } from '@/lib/ai/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { date, compareWithDate } = await request.json();

    if (!date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 });
    }

    // Get user's profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('goal, target_weight_lbs')
      .eq('id', user.id)
      .single();

    // Get current weight from body_stats
    const { data: latestWeight } = await supabase
      .from('body_stats')
      .select('weight_lbs')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    // Get photos for the specified date
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data: photos, error: photosError } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .gte('taken_at', startOfDay)
      .lte('taken_at', endOfDay)
      .order('taken_at', { ascending: false });

    if (photosError || !photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos found for this date' },
        { status: 404 }
      );
    }

    // Check if already analyzed (any photo in the set has ai_analysis)
    const alreadyAnalyzed = photos.some((p) => p.ai_analysis !== null);
    if (alreadyAnalyzed) {
      // Return existing analysis
      const existingAnalysis = photos.find((p) => p.ai_analysis)?.ai_analysis;
      return NextResponse.json({
        analysis: existingAnalysis,
        alreadyAnalyzed: true,
        date,
      });
    }

    // Deduplicate - keep only latest of each type
    const photosByType = new Map<string, typeof photos[0]>();
    for (const photo of photos) {
      if (!photosByType.has(photo.photo_type)) {
        photosByType.set(photo.photo_type, photo);
      }
    }
    const uniquePhotos = Array.from(photosByType.values());

    // Get comparison photos if requested
    let previousSetAnalysis: PhotoSetAnalysisResult | null = null;
    let previousSetDate: string | undefined;

    if (compareWithDate) {
      const compareStart = `${compareWithDate}T00:00:00.000Z`;
      const compareEnd = `${compareWithDate}T23:59:59.999Z`;

      const { data: previousPhotos } = await supabase
        .from('progress_photos')
        .select('ai_analysis')
        .eq('user_id', user.id)
        .gte('taken_at', compareStart)
        .lte('taken_at', compareEnd)
        .not('ai_analysis', 'is', null)
        .limit(1);

      if (previousPhotos && previousPhotos.length > 0) {
        previousSetAnalysis = previousPhotos[0].ai_analysis as PhotoSetAnalysisResult;
        previousSetDate = compareWithDate;
      }
    } else {
      // Auto-find previous analyzed set (closest date before current)
      const { data: previousPhotos } = await supabase
        .from('progress_photos')
        .select('ai_analysis, taken_at')
        .eq('user_id', user.id)
        .lt('taken_at', startOfDay)
        .not('ai_analysis', 'is', null)
        .order('taken_at', { ascending: false })
        .limit(1);

      if (previousPhotos && previousPhotos.length > 0) {
        previousSetAnalysis = previousPhotos[0].ai_analysis as PhotoSetAnalysisResult;
        previousSetDate = previousPhotos[0].taken_at.split('T')[0];
      }
    }

    // Download and convert photos to base64
    const photoData: Array<{
      type: 'front' | 'side' | 'back';
      base64: string;
      mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
    }> = [];

    for (const photo of uniquePhotos) {
      const { data: imageData, error: downloadError } = await supabase.storage
        .from('progress-photos')
        .download(photo.photo_url);

      if (downloadError || !imageData) {
        console.error(`Failed to download ${photo.photo_type} photo:`, downloadError);
        continue;
      }

      const arrayBuffer = await imageData.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      photoData.push({
        type: photo.photo_type as 'front' | 'side' | 'back',
        base64,
        mediaType: (imageData.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
      });
    }

    if (photoData.length === 0) {
      return NextResponse.json(
        { error: 'Failed to load photos for analysis' },
        { status: 500 }
      );
    }

    // Run AI analysis
    const analysis = await analyzeProgressPhotoSet(photoData, {
      goal: profile?.goal || 'maintain',
      currentWeight: latestWeight?.weight_lbs,
      targetWeight: profile?.target_weight_lbs,
      previousSetDate,
      previousSetAnalysis,
    });

    // Store analysis on all photos in the set
    const photoIds = uniquePhotos.map((p) => p.id);
    const { error: updateError } = await supabase
      .from('progress_photos')
      .update({ ai_analysis: analysis })
      .in('id', photoIds);

    if (updateError) {
      console.error('Failed to save analysis:', updateError);
      // Continue anyway - analysis was successful
    }

    return NextResponse.json({
      analysis,
      date,
      photosAnalyzed: photoData.length,
      comparedWith: previousSetDate || null,
    });
  } catch (error) {
    console.error('Photo set analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
