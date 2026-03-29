-- 1. `currency_id` カラムを追加して `currency(id)` を参照させる
ALTER TABLE stores
ADD COLUMN currency_id BIGINT REFERENCES currency(id) ON DELETE SET NULL;

-- 2. 既存の `currency` (TEXT) から対応する `currency_id` を設定する
UPDATE stores
SET currency_id = c.id
FROM currency c
WHERE stores.currency = c.currency_text;

-- 3. 不要になったテキストカラム `currency` を削除する
ALTER TABLE stores
DROP COLUMN currency;
