-- THE TEST TROOP: STORAGE BUCKET FOR BUG REPORT SCREENSHOTS
-- Copy and paste into Supabase Dashboard -> SQL Editor -> Run

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'submission-attachments',
    'submission-attachments',
    true,
    5242880, -- 5 MB per file
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can upload submission attachments" ON storage.objects;
CREATE POLICY "Public can upload submission attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'submission-attachments');

DROP POLICY IF EXISTS "Public can view submission attachments" ON storage.objects;
CREATE POLICY "Public can view submission attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'submission-attachments');
