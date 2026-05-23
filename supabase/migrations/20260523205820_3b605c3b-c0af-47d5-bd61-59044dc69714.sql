CREATE POLICY "Users update own moduler videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'moduler' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'moduler' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own moduler videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'moduler' AND (auth.uid())::text = (storage.foldername(name))[1]);