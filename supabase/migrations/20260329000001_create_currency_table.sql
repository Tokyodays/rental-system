CREATE TABLE IF NOT EXISTS currency (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  currency_text TEXT NOT NULL UNIQUE,
  currency_symbol TEXT NOT NULL
);

INSERT INTO currency (currency_text, currency_symbol) VALUES
  ('THB', '฿'),
  ('JPY', '¥'),
  ('USD', '$'),
  ('EUR', '€'),
  ('SGD', 'S$'),
  ('MYR', 'RM'),
  ('VND', '₫'),
  ('LAK', '₭'),
  ('KHR', '៛'),
  ('MMK', 'K')
ON CONFLICT (currency_text) DO NOTHING;

ALTER TABLE currency ENABLE ROW LEVEL SECURITY;
