-- Function to generate a random alphanumeric string (A-Z, a-z, 0-9)
CREATE OR REPLACE FUNCTION generate_random_alphanumeric(length int) RETURNS text AS $$
DECLARE
  chars text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  result text := '';
  i int := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to generate a UNIQUE vehicle code
CREATE OR REPLACE FUNCTION generate_unique_vehicle_code() RETURNS text AS $$
DECLARE
  new_code text;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique LOOP
    new_code := generate_random_alphanumeric(12);
    -- Check if this code already exists in vehicles table
    SELECT NOT EXISTS (SELECT 1 FROM vehicles WHERE code = new_code) INTO is_unique;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Set default for vehicles.code
ALTER TABLE vehicles ALTER COLUMN code SET DEFAULT generate_unique_vehicle_code();
