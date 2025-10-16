-- =====================================================
-- SESSION SYSTEM MIGRATION (Supabase/Postgres)
-- =====================================================

-- 1) Tabel customer_sessions
CREATE TABLE IF NOT EXISTS public.customer_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  toko_id uuid NOT NULL,
  table_number text NOT NULL,
  customer_name text,
  customer_phone text,
  status text DEFAULT 'active' CHECK (status IN ('active','closed','expired')),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  closed_at timestamp with time zone,
  total_orders_count integer DEFAULT 0,
  total_session_amount integer DEFAULT 0,
  last_activity_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_sessions_pkey PRIMARY KEY (id)
);

-- 2) Kolom tambahan di pesanan_online untuk session linkage
DO $$ BEGIN
  BEGIN
    ALTER TABLE public.pesanan_online ADD COLUMN session_token text;
  EXCEPTION WHEN duplicate_column THEN
    -- Kolom sudah ada
    NULL;
  END;

  BEGIN
    ALTER TABLE public.pesanan_online ADD COLUMN session_id uuid;
  EXCEPTION WHEN duplicate_column THEN
    -- Kolom sudah ada
    NULL;
  END;
END $$;

-- 3) Index untuk performa lookup session
CREATE INDEX IF NOT EXISTS idx_customer_sessions_lookup ON public.customer_sessions(toko_id, table_number, status);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON public.customer_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_pesanan_online_session ON public.pesanan_online(session_id);

-- 4) RPC Functions
-- Generate dan buat session baru
CREATE OR REPLACE FUNCTION public.create_customer_session(
  p_toko_id uuid,
  p_table_number text,
  p_customer_name text,
  p_customer_phone text
) RETURNS uuid AS $$
DECLARE
  v_session_id uuid;
  v_session_token text;
BEGIN
  v_session_token := 'sess_' || encode(gen_random_bytes(16), 'hex');

  INSERT INTO public.customer_sessions(
    session_token, toko_id, table_number, customer_name, customer_phone, expires_at
  ) VALUES (
    v_session_token, p_toko_id, p_table_number, p_customer_name, p_customer_phone,
    now() + interval '4 hours'
  ) RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Close session (akhiri masa session)
CREATE OR REPLACE FUNCTION public.close_customer_session(
  p_session_token text
) RETURNS boolean AS $$
BEGIN
  UPDATE public.customer_sessions
  SET status = 'closed', closed_at = now()
  WHERE session_token = p_session_token AND status = 'active';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update last activity
CREATE OR REPLACE FUNCTION public.update_session_activity(
  p_session_token text
) RETURNS boolean AS $$
BEGIN
  UPDATE public.customer_sessions
  SET last_activity_at = now()
  WHERE session_token = p_session_token AND status = 'active';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ambil order pada session (opsional helper)
CREATE OR REPLACE FUNCTION public.get_session_orders(
  p_session_token text
) RETURNS TABLE (
  id uuid,
  order_number text,
  total_amount integer,
  status text,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT po.id, po.order_number, po.total_amount, po.status, po.created_at
  FROM public.pesanan_online po
  WHERE po.session_token = p_session_token
  ORDER BY po.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Auto-expire session berdasarkan waktu
CREATE OR REPLACE FUNCTION public.auto_expire_sessions()
RETURNS integer AS $$
DECLARE v_expired integer; BEGIN
  UPDATE public.customer_sessions
  SET status = 'expired'
  WHERE status = 'active'
    AND (
      (expires_at IS NOT NULL AND expires_at < now()) OR
      (last_activity_at IS NOT NULL AND last_activity_at < now() - interval '4 hours')
    );
  GET DIAGNOSTICS v_expired = ROW_COUNT;
  RETURN v_expired;
END; $$ LANGUAGE plpgsql;


