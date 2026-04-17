'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Loader2, Check } from 'lucide-react';
import { getLocalDateString } from '@/lib/date';

type PhotoType = 'front' | 'side' | 'back';

interface PhotoSlot {
  type: PhotoType;
  file: File | null;
  preview: string | null;
  status: 'empty' | 'selected' | 'uploading' | 'done' | 'error';
  error?: string;
}

export function MultiPhotoUpload() {
  const router = useRouter();
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    side: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
  };

  const [takenAt, setTakenAt] = useState(getLocalDateString());
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<Record<PhotoType, PhotoSlot>>({
    front: { type: 'front', file: null, preview: null, status: 'empty' },
    side: { type: 'side', file: null, preview: null, status: 'empty' },
    back: { type: 'back', file: null, preview: null, status: 'empty' },
  });

  const handleFileSelect = useCallback((type: PhotoType, file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotos((prev) => ({
        ...prev,
        [type]: { ...prev[type], status: 'error', error: 'Invalid file type' },
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotos((prev) => ({
        ...prev,
        [type]: { ...prev[type], status: 'error', error: 'File too large (max 10MB)' },
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotos((prev) => ({
        ...prev,
        [type]: {
          type,
          file,
          preview: e.target?.result as string,
          status: 'selected',
        },
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleInputChange = (type: PhotoType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(type, e.target.files[0]);
    }
  };

  const clearPhoto = (type: PhotoType) => {
    setPhotos((prev) => ({
      ...prev,
      [type]: { type, file: null, preview: null, status: 'empty' },
    }));
    if (fileInputRefs[type].current) {
      fileInputRefs[type].current.value = '';
    }
  };

  const uploadSinglePhoto = async (slot: PhotoSlot): Promise<boolean> => {
    if (!slot.file) return false;

    setPhotos((prev) => ({
      ...prev,
      [slot.type]: { ...prev[slot.type], status: 'uploading' },
    }));

    try {
      // Get signed upload URL
      const uploadResponse = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: slot.file.name,
          contentType: slot.file.type,
          photoType: slot.type,
          takenAt,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, photo } = await uploadResponse.json();

      // Upload to storage
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': slot.file.type },
        body: slot.file,
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      // Trigger AI analysis (don't wait for it)
      fetch('/api/photos/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id }),
      });

      setPhotos((prev) => ({
        ...prev,
        [slot.type]: { ...prev[slot.type], status: 'done' },
      }));

      return true;
    } catch (error) {
      setPhotos((prev) => ({
        ...prev,
        [slot.type]: {
          ...prev[slot.type],
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        },
      }));
      return false;
    }
  };

  const handleUploadAll = async () => {
    const photosToUpload = Object.values(photos).filter((p) => p.file && p.status === 'selected');

    if (photosToUpload.length === 0) return;

    setIsUploading(true);

    // Upload all photos in parallel
    await Promise.all(photosToUpload.map(uploadSinglePhoto));

    setIsUploading(false);

    // Check if all uploads succeeded
    const allDone = Object.values(photos).every((p) => p.status === 'empty' || p.status === 'done');
    if (allDone) {
      router.push('/photos');
      router.refresh();
    }
  };

  const selectedCount = Object.values(photos).filter((p) => p.status === 'selected').length;
  const hasAnyPhoto = Object.values(photos).some((p) => p.file);

  const labels: Record<PhotoType, string> = {
    front: 'Front View',
    side: 'Side View',
    back: 'Back View',
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--neutral-dark)] mb-2">
          Date Taken
        </label>
        <Input
          type="date"
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
          max={getLocalDateString()}
          className="max-w-xs"
        />
      </div>

      {/* Photo Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['front', 'side', 'back'] as const).map((type) => {
          const slot = photos[type];
          return (
            <Card key={type} className="overflow-hidden">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-[var(--neutral-dark)] mb-3">
                  {labels[type]}
                </p>

                {slot.preview ? (
                  <div className="relative">
                    <div className="relative aspect-[3/4] rounded-[12px] overflow-hidden bg-[var(--neutral-gray-light)]">
                      <Image
                        src={slot.preview}
                        alt={`${type} preview`}
                        fill
                        className="object-cover"
                      />
                      {slot.status === 'uploading' && (
                        <div className="absolute inset-0 bg-[var(--theme-overlay-scrim)] flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                      {slot.status === 'done' && (
                        <div className="absolute inset-0 bg-[var(--success)]/20 flex items-center justify-center">
                          <div className="bg-[var(--success)] rounded-full p-2">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    {slot.status === 'selected' && (
                      <button
                        onClick={() => clearPhoto(type)}
                        className="absolute top-2 right-2 p-1.5 bg-[var(--theme-surface)] rounded-full shadow-lg hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-[var(--neutral-dark)]" />
                      </button>
                    )}
                    {slot.status === 'error' && (
                      <p className="mt-2 text-xs text-[var(--accent-coral)]">{slot.error}</p>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRefs[type].current?.click()}
                    className="aspect-[3/4] rounded-[12px] border-2 border-dashed border-[rgba(184,169,232,0.3)] hover:border-[var(--primary-deep)] hover:bg-[var(--primary-light)] cursor-pointer flex flex-col items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="h-8 w-8 text-[var(--neutral-gray)]" />
                    <span className="text-sm text-[var(--neutral-gray)]">Add photo</span>
                  </div>
                )}

                <input
                  ref={fileInputRefs[type]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleInputChange(type)}
                  className="hidden"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUploadAll}
        disabled={!hasAnyPhoto || isUploading || selectedCount === 0}
        className="w-full"
        size="lg"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload {selectedCount > 0 ? `${selectedCount} Photo${selectedCount > 1 ? 's' : ''}` : 'Photos'}
          </>
        )}
      </Button>
    </div>
  );
}
