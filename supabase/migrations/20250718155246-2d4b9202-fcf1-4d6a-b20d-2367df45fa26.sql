-- Create storage bucket for vehicle documents
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-documents', 'vehicle-documents', true);

-- Create policies for vehicle documents storage
CREATE POLICY "Documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'vehicle-documents');

CREATE POLICY "Users can upload vehicle documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'vehicle-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update vehicle documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'vehicle-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete vehicle documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'vehicle-documents' AND auth.uid() IS NOT NULL);