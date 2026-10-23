-- 車両の削除は論理削除にする（貸出履歴 transactions が車両を参照しているため、行は残す）
-- NULL = 通常の車両。値があれば削除済みとして一覧・貸出・ダッシュボードから除外し、取引履歴には残す
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
