-- Custom SQL migration file, put you code below! --
UPDATE car_park
SET location = ST_SetSRID(location::geometry, 3414)
WHERE ST_SRID(location) = 0;

ALTER TABLE car_park
ALTER COLUMN location TYPE geometry(Point, 3414)
USING ST_SetSRID(location::geometry, 3414);

CREATE INDEX idx_carpark_location ON car_park USING GIST (location);