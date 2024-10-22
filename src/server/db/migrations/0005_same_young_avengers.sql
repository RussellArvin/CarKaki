-- Custom SQL migration file, put you code below! --


CREATE OR REPLACE FUNCTION calculate_parking_rate(
    p_car_park_id UUID,
    p_duration_hours DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    v_start_timestamp TIMESTAMP;
    v_current_time TIME;
    v_rate_record RECORD;
    v_total_rate DECIMAL := 0;
    v_remaining_minutes INTEGER;
    v_segment_minutes INTEGER;
    v_day_type TEXT;
    v_current_timestamp TIMESTAMP;
    v_dow INTEGER;
    v_ph_dates DATE[];
BEGIN
    -- Input validation
    IF p_duration_hours <= 0 OR p_duration_hours > 24 THEN
        RAISE EXCEPTION 'Duration must be between 0 and 24 hours';
    END IF;

    -- Set start timestamp to current time
    v_start_timestamp := NOW();
    v_current_timestamp := v_start_timestamp;
    
    -- Get all relevant public holiday dates upfront
    SELECT ARRAY_AGG(day) INTO v_ph_dates
    FROM public_holiday
    WHERE day BETWEEN DATE(v_start_timestamp) AND DATE(v_start_timestamp + interval '1 day');
    
    -- Convert duration to minutes for calculation
    v_remaining_minutes := CEIL(p_duration_hours * 60);
    
    WHILE v_remaining_minutes > 0 LOOP
        -- Get current time for rate lookup
        v_current_time := v_current_timestamp::TIME;
        v_dow := EXTRACT(DOW FROM v_current_timestamp);
        
        -- Determine day type
        IF v_dow = 0 OR DATE(v_current_timestamp) = ANY(v_ph_dates) THEN
            v_day_type := 'SUN_PH';
        ELSIF v_dow = 6 THEN
            v_day_type := 'SAT';
        ELSE
            v_day_type := 'WEEKDAY';
        END IF;
        
        -- Find applicable rate record (simplified lookup)
        SELECT *
        INTO v_rate_record
        FROM car_park_rate
        WHERE car_park_id = p_car_park_id
        ORDER BY CASE 
            WHEN start_time <= v_current_time AND end_time > v_current_time THEN 0
            ELSE ABS(EXTRACT(EPOCH FROM (start_time - v_current_time)))
        END
        LIMIT 1;
            
        IF NOT FOUND THEN
            RAISE EXCEPTION 'No rates configured for car park: %', p_car_park_id;
        END IF;
        
        -- Calculate minutes for this segment
        v_segment_minutes := LEAST(
            v_remaining_minutes,
            60  -- Process maximum 1 hour at a time
        );
        
        -- Apply rate based on day type with weekday fallback
        v_total_rate := v_total_rate + 
            CASE v_day_type
                WHEN 'WEEKDAY' THEN 
                    CEIL(v_segment_minutes::decimal / GREATEST(v_rate_record.weekday_min, 1)) * v_rate_record.weekday_rate
                WHEN 'SAT' THEN 
                    CEIL(v_segment_minutes::decimal / 
                         GREATEST(COALESCE(v_rate_record.sat_min, v_rate_record.weekday_min), 1)) * 
                    COALESCE(v_rate_record.sat_rate, v_rate_record.weekday_rate)
                WHEN 'SUN_PH' THEN 
                    CEIL(v_segment_minutes::decimal / 
                         GREATEST(COALESCE(v_rate_record.sun_ph_min, v_rate_record.weekday_min), 1)) * 
                    COALESCE(v_rate_record.sun_ph_rate, v_rate_record.weekday_rate)
            END;
        
        -- Update remaining time and current timestamp
        v_remaining_minutes := v_remaining_minutes - v_segment_minutes;
        v_current_timestamp := v_current_timestamp + (v_segment_minutes * interval '1 minute');
    END LOOP;
    
    RETURN v_total_rate;
END;
$$ LANGUAGE plpgsql;