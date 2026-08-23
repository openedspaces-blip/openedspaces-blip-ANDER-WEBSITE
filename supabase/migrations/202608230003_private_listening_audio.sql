-- Listening downloads are a Premium benefit. Public Storage URLs would let
-- anyone bypass that check, so the API now serves short-lived signed URLs.
-- Apply this together with the application release that signs playback URLs.
UPDATE storage.buckets
SET public = false
WHERE id = 'lesson-audio';
