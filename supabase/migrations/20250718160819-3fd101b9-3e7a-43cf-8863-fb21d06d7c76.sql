-- Add current_location field to odometer_readings table for location tracking
ALTER TABLE odometer_readings 
ADD COLUMN current_location TEXT;