-- 最後にオイル交換した日付（履歴は持たず、最新の日付だけを上書きで記録する）。NULL は未記録
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_oil_change_on DATE;
