-- Enable read access to all users (or authenticated users) for currency table
CREATE POLICY "Allow read access to anyone" ON currency FOR SELECT USING (true);
