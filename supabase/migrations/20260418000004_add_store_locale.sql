-- 店舗ごとのデフォルト言語設定を追加
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS default_locale TEXT DEFAULT 'en';

-- 言語設定を保存するためのポリシーを念のため確認（adminが必要）
-- 既存の店舗情報を更新できるのは admin のみというポリシーが既に他にあるはずですが、
-- ここではカラムの追加のみ行います。
