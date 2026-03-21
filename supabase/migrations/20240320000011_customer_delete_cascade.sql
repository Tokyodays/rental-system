-- 顧客削除時に紐付くレンタル履歴や予約も自動削除されるよう制約を変更
ALTER TABLE rentals
DROP CONSTRAINT IF EXISTS rentals_customer_id_fkey,
ADD CONSTRAINT rentals_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE CASCADE;

ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_customer_id_fkey,
ADD CONSTRAINT reservations_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE CASCADE;
