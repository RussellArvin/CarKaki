-- Custom SQL migration file, put you code below! --

INSERT INTO public_holiday (id, name, day)
VALUES 
    (gen_random_uuid(), 'New Year''s Day', '2024-01-01'),
    (gen_random_uuid(), 'Chinese New Year', '2024-02-10'),
    (gen_random_uuid(), 'Chinese New Year', '2024-02-11'),
    (gen_random_uuid(), 'Good Friday', '2024-03-29'),
    (gen_random_uuid(), 'Hari Raya Puasa', '2024-04-10'),
    (gen_random_uuid(), 'Labour Day', '2024-05-01'),
    (gen_random_uuid(), 'Vesak Day', '2024-05-22'),
    (gen_random_uuid(), 'Hari Raya Haji', '2024-06-17'),
    (gen_random_uuid(), 'National Day', '2024-08-09'),
    (gen_random_uuid(), 'Deepavali', '2024-10-31'),
    (gen_random_uuid(), 'Christmas Day', '2024-12-25');

CREATE OR REPLACE FUNCTION calculate_parking_rate(
    p_car_park_id UUID,
    p_duration_hours DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    v_start_timestamp TIMESTAMP;
    v_end_timestamp TIMESTAMP;
    v_current_time TIME;
    v_rate_record RECORD;
    v_total_rate DECIMAL := 0;
    v_remaining_minutes INTEGER;
    v_segment_minutes INTEGER;
    v_is_start_day_ph BOOLEAN;
    v_is_next_day_ph BOOLEAN;
    v_day_type TEXT;
    v_current_timestamp TIMESTAMP;
    v_dow INTEGER;
BEGIN
    -- Input validation
    IF p_duration_hours <= 0 OR p_duration_hours > 24 THEN
        RAISE EXCEPTION 'Duration must be between 0 and 24 hours';
    END IF;
    -- Set start timestamp to current time
    v_start_timestamp := NOW();
    
    -- Calculate end timestamp
    v_end_timestamp := v_start_timestamp + (p_duration_hours * interval '1 hour');
    
    -- Check if start day is a public holiday
    v_is_start_day_ph := EXISTS (
        SELECT 1 
        FROM public_holiday 
        WHERE day = DATE(v_start_timestamp)
    );
    
    -- Check if next day is a public holiday (if duration overlaps to next day)
    v_is_next_day_ph := EXISTS (
        SELECT 1 
        FROM public_holiday 
        WHERE day = DATE(v_start_timestamp + interval '1 day')
    );
    
    -- Convert duration to minutes for calculation
    v_remaining_minutes := CEIL(p_duration_hours * 60);
    v_current_timestamp := v_start_timestamp;
    
    WHILE v_remaining_minutes > 0 LOOP
        -- Get current time for rate lookup
        v_current_time := v_current_timestamp::TIME;
        
        -- Get day of week (0 = Sunday, 6 = Saturday)
        v_dow := date_part('dow', v_current_timestamp);
        
        -- Determine day type
        IF v_dow = 0 OR 
           (DATE(v_current_timestamp) = DATE(v_start_timestamp) AND v_is_start_day_ph) OR
           (DATE(v_current_timestamp) > DATE(v_start_timestamp) AND v_is_next_day_ph) THEN
            v_day_type := 'SUN_PH';
        ELSIF v_dow = 6 THEN
            v_day_type := 'SAT';
        ELSE
            v_day_type := 'WEEKDAY';
        END IF;
        
        -- Find applicable rate record
        SELECT *
        INTO v_rate_record
        FROM car_park_rate
        WHERE car_park_id = p_car_park_id
          AND start_time <= v_current_time
          AND end_time > v_current_time
        ORDER BY start_time
        LIMIT 1;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'No rate found for time: %', v_current_time;
        END IF;
        
        -- Calculate minutes for this segment (until either rate period ends or day changes)
        v_segment_minutes := LEAST(
            v_remaining_minutes,
            -- Minutes until end of rate period
            ((DATE(v_current_timestamp) + v_rate_record.end_time::interval) - v_current_timestamp) / interval '1 minute',
            -- Minutes until midnight
            (date_trunc('day', v_current_timestamp) + interval '1 day' - v_current_timestamp) / interval '1 minute'
        );
        
        -- Apply appropriate rate based on day type
        v_total_rate := v_total_rate + 
            CASE v_day_type
                WHEN 'WEEKDAY' THEN 
                    CEIL(v_segment_minutes::decimal / v_rate_record.weekday_min) * v_rate_record.weekday_rate
                WHEN 'SAT' THEN 
                    CEIL(v_segment_minutes::decimal / v_rate_record.sat_min) * v_rate_record.sat_rate
                WHEN 'SUN_PH' THEN 
                    CEIL(v_segment_minutes::decimal / v_rate_record.sun_ph_min) * v_rate_record.sun_ph_rate
            END;
        
        -- Update remaining time and current timestamp
        v_remaining_minutes := v_remaining_minutes - v_segment_minutes;
        v_current_timestamp := v_current_timestamp + (v_segment_minutes * interval '1 minute');
    END LOOP;
    
    RETURN v_total_rate;
END;
$$ LANGUAGE plpgsql;