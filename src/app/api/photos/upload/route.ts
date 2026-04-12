import { createClientForApi } from '@/lib/supabase/server';
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
    const { fileName, contentType, photoType, takenAt } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Generate unique file path: {user_id}/{timestamp}_{fileName}
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;

    // Create signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('progress-photos')
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.error('Failed to create signed URL:', uploadError);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    // Also get a signed URL for viewing (valid for 1 hour)
    const { data: urlData } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(filePath, 3600);

    // Create the progress_photos record
    const { data: photo, error: photoError } = await supabase
      .from('progress_photos')
      .insert({
        user_id: user.id,
        photo_url: filePath, // Store the path, we'll generate signed URLs on the fly
        photo_type: photoType || 'front',
        taken_at: takenAt || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (photoError) {
      console.error('Failed to create photo record:', photoError);
      return NextResponse.json(
        { error: 'Failed to create photo record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      token: uploadData.token,
      path: filePath,
      viewUrl: urlData?.signedUrl,
      photo,
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list photos
export async function GET(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoType = searchParams.get('type');

  let query = supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .order('taken_at', { ascending: false });

  if (photoType && photoType !== 'all') {
    query = query.eq('photo_type', photoType);
  }

  const { data: photos, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }

  // Generate signed URLs for each photo
  const photosWithUrls = await Promise.all(
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

  return NextResponse.json({ photos: photosWithUrls });
}

// DELETE endpoint to remove a photo
export async function DELETE(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get('id');

  if (!photoId) {
    return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
  }

  // Get the photo to find the storage path
  const { data: photo } = await supabase
    .from('progress_photos')
    .select('photo_url')
    .eq('id', photoId)
    .eq('user_id', user.id)
    .single();

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  // Delete from storage
  await supabase.storage.from('progress-photos').remove([photo.photo_url]);

  // Delete from database
  const { error } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
