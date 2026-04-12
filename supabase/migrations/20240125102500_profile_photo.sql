-- Add profile photo URL to profiles
alter table public.profiles
add column if not exists profile_photo_url text;

-- Comment for documentation
comment on column public.profiles.profile_photo_url is 'URL to user profile photo in storage';

-- Create storage bucket for profile photos if not exists
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- Storage policy for profile photos - users can upload their own
create policy "Users can upload their own profile photo"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own profile photo
create policy "Users can update their own profile photo"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own profile photo
create policy "Users can delete their own profile photo"
  on storage.objects for delete
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view profile photos (public bucket)
create policy "Profile photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'profile-photos');
