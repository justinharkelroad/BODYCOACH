'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { getLocalDateString } from '@/lib/date';

interface PhotoUploadFormProps {
  onSuccess?: () => void;
}

export function PhotoUploadForm({ onSuccess }: PhotoUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back'>('front');
  const [takenAt, setTakenAt] = useState(getLocalDateString());
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Get signed upload URL
      const uploadResponse = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          photoType,
          takenAt,
        }),
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || 'Failed to get upload URL');
      }

      const { uploadUrl, photo } = await uploadResponse.json();

      // Step 2: Upload file to Supabase Storage
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Trigger AI analysis
      await fetch('/api/photos/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id }),
      });

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/photos');
        router.refresh();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[var(--neutral-dark)]">Upload Progress Photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Type Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-dark)] mb-2">
            Photo Type
          </label>
          <div className="flex gap-3">
            {(['front', 'side', 'back'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPhotoType(type)}
                className={`
                  flex-1 py-3 px-4 rounded-[12px] text-sm font-medium capitalize transition-all
                  ${
                    photoType === type
                      ? 'bg-[var(--primary-deep)] text-white'
                      : 'bg-[var(--neutral-gray-light)] text-[var(--neutral-gray)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-deep)]'
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

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
          />
        </div>

        {/* Drop Zone / Preview */}
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-dark)] mb-2">
            Photo
          </label>

          {preview ? (
            <div className="relative rounded-[12px] overflow-hidden bg-[var(--neutral-gray-light)]">
              <div className="relative aspect-[3/4] max-h-[400px]">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                onClick={clearSelection}
                className="absolute top-3 right-3 p-2 bg-[var(--theme-surface)] rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-[var(--neutral-dark)]" />
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-[12px] p-8 text-center cursor-pointer
                transition-all duration-200
                ${
                  dragActive
                    ? 'border-[var(--primary-deep)] bg-[var(--primary-light)]'
                    : 'border-[rgba(184,169,232,0.3)] hover:border-[var(--primary-deep)] hover:bg-[var(--primary-light)]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-[var(--primary-light)] rounded-full">
                  <Camera className="h-8 w-8 text-[var(--primary-deep)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--neutral-dark)]">
                    Drop your photo here or click to browse
                  </p>
                  <p className="text-sm text-[var(--neutral-gray)] mt-1">
                    JPEG, PNG, or WebP up to 10MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-dark)] mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling today?"
            rows={3}
            className="w-full px-4 py-3 rounded-[12px] border border-[rgba(184,169,232,0.2)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-deep)] focus:border-transparent resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-[rgba(255,107,107,0.1)] text-[var(--accent-coral)] rounded-[12px] text-sm">
            {error}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading & Analyzing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
