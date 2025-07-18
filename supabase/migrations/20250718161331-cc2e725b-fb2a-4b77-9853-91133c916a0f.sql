-- Add sample odometer readings for testing
-- Only insert if no readings exist yet
DO $$
DECLARE
    vehicle_id1 UUID;
    vehicle_id2 UUID;
    user_id1 UUID;
BEGIN
    -- Get first two vehicles and a user for sample data
    SELECT id INTO vehicle_id1 FROM vehicles LIMIT 1;
    SELECT id INTO vehicle_id2 FROM vehicles OFFSET 1 LIMIT 1;
    SELECT id INTO user_id1 FROM auth.users LIMIT 1;

    -- Only insert sample data if no odometer readings exist
    IF NOT EXISTS (SELECT 1 FROM odometer_readings) AND vehicle_id1 IS NOT NULL AND user_id1 IS NOT NULL THEN
        -- Sample readings for first vehicle
        INSERT INTO odometer_readings (vehicle_id, reading_date, odometer_reading, current_location, notes, created_by)
        VALUES 
            (vehicle_id1, CURRENT_DATE - INTERVAL '30 days', 25000, 'Main Office', 'Initial reading', user_id1),
            (vehicle_id1, CURRENT_DATE - INTERVAL '25 days', 25150, 'Client Site A', 'After site visit', user_id1),
            (vehicle_id1, CURRENT_DATE - INTERVAL '20 days', 25320, 'Workshop', 'Maintenance visit', user_id1),
            (vehicle_id1, CURRENT_DATE - INTERVAL '15 days', 25480, 'Fuel Station', 'Regular refuel', user_id1),
            (vehicle_id1, CURRENT_DATE - INTERVAL '10 days', 25650, 'Main Office', 'Back to base', user_id1),
            (vehicle_id1, CURRENT_DATE - INTERVAL '5 days', 25800, 'Client Site B', 'Project delivery', user_id1),
            (vehicle_id1, CURRENT_DATE - INTERVAL '2 days', 25920, 'Main Office', 'Weekly check', user_id1);

        -- Sample readings for second vehicle if it exists
        IF vehicle_id2 IS NOT NULL THEN
            INSERT INTO odometer_readings (vehicle_id, reading_date, odometer_reading, current_location, notes, created_by)
            VALUES 
                (vehicle_id2, CURRENT_DATE - INTERVAL '28 days', 18500, 'Main Office', 'Monthly reading', user_id1),
                (vehicle_id2, CURRENT_DATE - INTERVAL '21 days', 18720, 'Regional Office', 'Branch visit', user_id1),
                (vehicle_id2, CURRENT_DATE - INTERVAL '14 days', 18900, 'Service Center', 'Routine maintenance', user_id1),
                (vehicle_id2, CURRENT_DATE - INTERVAL '7 days', 19080, 'Main Office', 'Weekly update', user_id1),
                (vehicle_id2, CURRENT_DATE - INTERVAL '3 days', 19200, 'Client Location', 'Service call', user_id1);
        END IF;
    END IF;
END $$;