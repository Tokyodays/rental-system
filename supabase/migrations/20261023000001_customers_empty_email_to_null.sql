-- 未入力のメールアドレスが空文字で保存されていたため、2件目以降の登録が
-- customers_email_key（UNIQUE）違反で失敗していた。アプリ側で NULL を保存するよう修正したので、既存データも揃える
UPDATE customers SET email = NULL WHERE email = '';
