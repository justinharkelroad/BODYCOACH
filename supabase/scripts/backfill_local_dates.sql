-- =====================================================================
-- One-off cleanup: fix rows auto-dated with the old UTC-slicing bug.
--
-- WHEN TO RUN: AFTER `profiles.timezone` has been populated with each
-- user's real IANA timezone (handled by the TimezoneSync client component
-- at src/components/timezone-sync.tsx). Wait 1–2 weeks after deploy so
-- active users have had a chance to return.
--
-- SAFETY: Each UPDATE is filtered to rows where the stored date matches
-- the UTC date at creation time — i.e., rows auto-dated by the old bug.
-- User-edited dates (someone picking "April 10" for a weight entry or
-- photo) are left untouched because the stored date won't match the UTC
-- creation date.
--
-- Run sections one at a time. Start with the SELECT preview, review the
-- counts, then run the matching UPDATE.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. food_logs (uses logged_at — the actual time the food was logged)
-- ---------------------------------------------------------------------

-- PREVIEW
SELECT COUNT(*) AS rows_to_fix
FROM food_logs fl
JOIN profiles p ON p.id = fl.user_id
WHERE p.timezone IS NOT NULL
  AND p.timezone <> 'UTC'
  AND fl.log_date = (fl.logged_at AT TIME ZONE 'UTC')::date
  AND fl.log_date <> (fl.logged_at AT TIME ZONE p.timezone)::date;

-- APPLY
-- UPDATE food_logs fl
-- SET log_date = (fl.logged_at AT TIME ZONE p.timezone)::date
-- FROM profiles p
-- WHERE fl.user_id = p.id
--   AND p.timezone IS NOT NULL
--   AND p.timezone <> 'UTC'
--   AND fl.log_date = (fl.logged_at AT TIME ZONE 'UTC')::date
--   AND fl.log_date <> (fl.logged_at AT TIME ZONE p.timezone)::date;


-- ---------------------------------------------------------------------
-- 2. daily_checkins (uses created_at — the time the check-in was saved)
-- ---------------------------------------------------------------------

-- PREVIEW
SELECT COUNT(*) AS rows_to_fix
FROM daily_checkins dc
JOIN profiles p ON p.id = dc.user_id
WHERE p.timezone IS NOT NULL
  AND p.timezone <> 'UTC'
  AND dc.date = (dc.created_at AT TIME ZONE 'UTC')::date
  AND dc.date <> (dc.created_at AT TIME ZONE p.timezone)::date;

-- APPLY — NOTE: daily_checkins has UNIQUE (user_id, date). If the corrected
-- date already has a row for the same user, the UPDATE will fail. In that
-- case decide per-row whether to keep the existing row or merge. Review
-- conflicts with the query below BEFORE running the UPDATE.

-- Conflict check:
-- SELECT dc.user_id, dc.date AS current_date, (dc.created_at AT TIME ZONE p.timezone)::date AS target_date
-- FROM daily_checkins dc
-- JOIN profiles p ON p.id = dc.user_id
-- JOIN daily_checkins existing
--   ON existing.user_id = dc.user_id
--  AND existing.date = (dc.created_at AT TIME ZONE p.timezone)::date
-- WHERE p.timezone IS NOT NULL
--   AND p.timezone <> 'UTC'
--   AND dc.date = (dc.created_at AT TIME ZONE 'UTC')::date
--   AND dc.date <> (dc.created_at AT TIME ZONE p.timezone)::date
--   AND existing.id <> dc.id;

-- UPDATE daily_checkins dc
-- SET date = (dc.created_at AT TIME ZONE p.timezone)::date
-- FROM profiles p
-- WHERE dc.user_id = p.id
--   AND p.timezone IS NOT NULL
--   AND p.timezone <> 'UTC'
--   AND dc.date = (dc.created_at AT TIME ZONE 'UTC')::date
--   AND dc.date <> (dc.created_at AT TIME ZONE p.timezone)::date;


-- ---------------------------------------------------------------------
-- 3. body_stats (uses created_at)
-- ---------------------------------------------------------------------
-- Same unique-constraint caveat as daily_checkins: body_stats has
-- UNIQUE (user_id, recorded_at). Run the conflict check before UPDATE.

-- PREVIEW
SELECT COUNT(*) AS rows_to_fix
FROM body_stats bs
JOIN profiles p ON p.id = bs.user_id
WHERE p.timezone IS NOT NULL
  AND p.timezone <> 'UTC'
  AND bs.recorded_at = (bs.created_at AT TIME ZONE 'UTC')::date
  AND bs.recorded_at <> (bs.created_at AT TIME ZONE p.timezone)::date;

-- APPLY
-- UPDATE body_stats bs
-- SET recorded_at = (bs.created_at AT TIME ZONE p.timezone)::date
-- FROM profiles p
-- WHERE bs.user_id = p.id
--   AND p.timezone IS NOT NULL
--   AND p.timezone <> 'UTC'
--   AND bs.recorded_at = (bs.created_at AT TIME ZONE 'UTC')::date
--   AND bs.recorded_at <> (bs.created_at AT TIME ZONE p.timezone)::date;


-- ---------------------------------------------------------------------
-- 4. workout_logs (uses created_at)
-- ---------------------------------------------------------------------

-- PREVIEW
SELECT COUNT(*) AS rows_to_fix
FROM workout_logs wl
JOIN profiles p ON p.id = wl.user_id
WHERE p.timezone IS NOT NULL
  AND p.timezone <> 'UTC'
  AND wl.workout_date = (wl.created_at AT TIME ZONE 'UTC')::date
  AND wl.workout_date <> (wl.created_at AT TIME ZONE p.timezone)::date;

-- APPLY
-- UPDATE workout_logs wl
-- SET workout_date = (wl.created_at AT TIME ZONE p.timezone)::date
-- FROM profiles p
-- WHERE wl.user_id = p.id
--   AND p.timezone IS NOT NULL
--   AND p.timezone <> 'UTC'
--   AND wl.workout_date = (wl.created_at AT TIME ZONE 'UTC')::date
--   AND wl.workout_date <> (wl.created_at AT TIME ZONE p.timezone)::date;


-- ---------------------------------------------------------------------
-- 5. progress_photos (uses created_at)
-- ---------------------------------------------------------------------

-- PREVIEW
SELECT COUNT(*) AS rows_to_fix
FROM progress_photos pp
JOIN profiles p ON p.id = pp.user_id
WHERE p.timezone IS NOT NULL
  AND p.timezone <> 'UTC'
  AND pp.taken_at = (pp.created_at AT TIME ZONE 'UTC')::date
  AND pp.taken_at <> (pp.created_at AT TIME ZONE p.timezone)::date;

-- APPLY
-- UPDATE progress_photos pp
-- SET taken_at = (pp.created_at AT TIME ZONE p.timezone)::date
-- FROM profiles p
-- WHERE pp.user_id = p.id
--   AND p.timezone IS NOT NULL
--   AND p.timezone <> 'UTC'
--   AND pp.taken_at = (pp.created_at AT TIME ZONE 'UTC')::date
--   AND pp.taken_at <> (pp.created_at AT TIME ZONE p.timezone)::date;
