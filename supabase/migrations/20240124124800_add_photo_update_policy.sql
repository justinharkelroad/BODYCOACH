-- Add missing UPDATE policy for progress_photos
-- This allows users to update their own photos (needed for AI analysis)

create policy "Users can update own photos"
  on public.progress_photos for update
  using (auth.uid() = user_id);
