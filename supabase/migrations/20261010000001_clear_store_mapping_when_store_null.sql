-- staff.store_id が NULL になった(または NULL で作られた)とき、古い店舗情報が残らないようにする。
-- super_admin は店舗を持たないため、get_auth_store_id() は NULL を返すのが正しい。

-- 1. user_store_map: NULL なら対応行を削除する
CREATE OR REPLACE FUNCTION public.sync_user_store_map()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_store_map WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;

  IF NEW.store_id IS NULL THEN
    DELETE FROM public.user_store_map WHERE user_id = NEW.id;
  ELSE
    INSERT INTO public.user_store_map (user_id, store_id)
    VALUES (NEW.id, NEW.store_id)
    ON CONFLICT (user_id) DO UPDATE SET store_id = EXCLUDED.store_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. auth.users.raw_user_meta_data.store_id: NULL なら削除する
CREATE OR REPLACE FUNCTION public.sync_store_id_to_user_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD IS NULL OR NEW.store_id IS DISTINCT FROM OLD.store_id THEN
    UPDATE auth.users
    SET raw_user_meta_data =
      CASE
        WHEN NEW.store_id IS NULL
          THEN COALESCE(raw_user_meta_data, '{}'::jsonb) - 'store_id'
        ELSE COALESCE(raw_user_meta_data, '{}'::jsonb)
          || jsonb_build_object('store_id', NEW.store_id::text)
      END
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
