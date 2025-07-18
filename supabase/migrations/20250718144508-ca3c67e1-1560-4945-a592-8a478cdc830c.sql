-- Create storage bucket for maintenance photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('maintenance-photos', 'maintenance-photos', true);

-- Create storage policies for maintenance photos
CREATE POLICY "Anyone can view maintenance photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'maintenance-photos');

CREATE POLICY "Authenticated users can upload maintenance photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'maintenance-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their maintenance photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'maintenance-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete maintenance photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'maintenance-photos' AND auth.uid() IS NOT NULL);