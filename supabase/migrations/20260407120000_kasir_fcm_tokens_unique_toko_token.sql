-- Satu token FCM tidak boleh didaftarkan dua kali untuk toko yang sama.
-- Hapus duplikat (pertahankan baris dengan updated_at terbaru), lalu UNIQUE (toko_id, fcm_token).
-- Aplikasi kasir: setelah ini, gunakan upsert / ON CONFLICT (toko_id, fcm_token) untuk simpan token.

DELETE FROM public.kasir_fcm_tokens
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY toko_id, fcm_token
        ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id
      ) AS rn
    FROM public.kasir_fcm_tokens
  ) t
  WHERE t.rn > 1
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'kasir_fcm_tokens'
      AND c.conname = 'kasir_fcm_tokens_toko_id_fcm_token_key'
  ) THEN
    ALTER TABLE public.kasir_fcm_tokens
      ADD CONSTRAINT kasir_fcm_tokens_toko_id_fcm_token_key UNIQUE (toko_id, fcm_token);
  END IF;
END $$;
