-- Add UPDATE policy for rentals to allow completing the return process (Idempotent)
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."rentals";
CREATE POLICY "Enable update for all users" ON "public"."rentals" FOR UPDATE USING (true);
