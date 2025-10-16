-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  username text NOT NULL,
  action text NOT NULL,
  meta jsonb,
  CONSTRAINT admin_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_mibebi_account (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamp with time zone,
  created_by uuid,
  CONSTRAINT admin_mibebi_account_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_settings (
  id integer NOT NULL DEFAULT nextval('admin_settings_id_seq'::regclass),
  setting_key character varying NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_greetings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  text text NOT NULL,
  category text,
  CONSTRAINT ai_greetings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.billing_statements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  period_year integer NOT NULL,
  period_month integer NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  total_admin_fee integer NOT NULL DEFAULT 0,
  total_transactions integer NOT NULL DEFAULT 0,
  admin_share integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'invoiced'::text, 'paid'::text, 'overdue'::text])),
  invoice_number text,
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  approved_by uuid,
  approved_at timestamp with time zone,
  approval_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT billing_statements_pkey PRIMARY KEY (id),
  CONSTRAINT billing_statements_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id),
  CONSTRAINT billing_statements_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.admin_mibebi_account(id)
);
CREATE TABLE public.customer_reminder_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pelanggan_id uuid NOT NULL,
  toko_id uuid NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type = ANY (ARRAY['inactive_2weeks'::text, 'birthday'::text, 'promo'::text])),
  message_content text NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'sent'::text CHECK (status = ANY (ARRAY['sent'::text, 'delivered'::text, 'failed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_reminder_history_pkey PRIMARY KEY (id),
  CONSTRAINT customer_reminder_history_pelanggan_id_fkey FOREIGN KEY (pelanggan_id) REFERENCES public.pelanggan(id),
  CONSTRAINT customer_reminder_history_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.customer_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  toko_id uuid NOT NULL,
  table_number text NOT NULL,
  customer_name text,
  customer_phone text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'closed'::text, 'expired'::text])),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  closed_at timestamp with time zone,
  total_orders_count integer DEFAULT 0,
  total_session_amount integer DEFAULT 0,
  last_activity_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.flashsale_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid NOT NULL,
  CONSTRAINT flashsale_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT flashsale_campaigns_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.flashsale_order_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  flashsale_product_id uuid NOT NULL,
  menu_id uuid,
  variasi_id uuid,
  menu_name text NOT NULL,
  variasi_name text,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  original_price integer NOT NULL,
  total_price integer NOT NULL,
  discount_amount integer NOT NULL,
  notes text,
  CONSTRAINT flashsale_order_details_pkey PRIMARY KEY (id),
  CONSTRAINT flashsale_order_details_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu(id),
  CONSTRAINT flashsale_order_details_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.flashsale_orders(id),
  CONSTRAINT flashsale_order_details_flashsale_product_id_fkey FOREIGN KEY (flashsale_product_id) REFERENCES public.flashsale_products(id),
  CONSTRAINT flashsale_order_details_variasi_id_fkey FOREIGN KEY (variasi_id) REFERENCES public.menu_variasi(id)
);
CREATE TABLE public.flashsale_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  toko_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  order_status text NOT NULL DEFAULT 'pending'::text CHECK (order_status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])),
  total_amount integer NOT NULL,
  subtotal integer NOT NULL,
  admin_fee integer DEFAULT 1000,
  pickup_code text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  notes text,
  pelanggan_id uuid,
  transaksi_id uuid,
  flashsale_user_id uuid,
  CONSTRAINT flashsale_orders_pkey PRIMARY KEY (id),
  CONSTRAINT flashsale_orders_flashsale_user_id_fkey FOREIGN KEY (flashsale_user_id) REFERENCES public.flashsale_user(id),
  CONSTRAINT flashsale_orders_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.flashsale_campaigns(id),
  CONSTRAINT flashsale_orders_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id),
  CONSTRAINT flashsale_orders_pelanggan_id_fkey FOREIGN KEY (pelanggan_id) REFERENCES public.pelanggan(id),
  CONSTRAINT flashsale_orders_transaksi_id_fkey FOREIGN KEY (transaksi_id) REFERENCES public.transaksi(id)
);
CREATE TABLE public.flashsale_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  menu_id uuid,
  flashsale_price integer NOT NULL,
  original_price integer NOT NULL,
  stock_available integer NOT NULL,
  stock_sold integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  menu_name text NOT NULL CHECK (menu_name IS NOT NULL AND length(TRIM(BOTH FROM menu_name)) > 0),
  menu_category text,
  menu_image_url text,
  menu_variasi_data jsonb,
  CONSTRAINT flashsale_products_pkey PRIMARY KEY (id),
  CONSTRAINT flashsale_products_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.flashsale_campaigns(id)
);
CREATE TABLE public.flashsale_user (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  google_id character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  nama character varying,
  no_handphone character varying,
  profile_picture_url text,
  is_profile_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT flashsale_user_pkey PRIMARY KEY (id)
);
CREATE TABLE public.karyawan (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  username text NOT NULL,
  password text NOT NULL,
  nama text NOT NULL,
  toko_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'karyawan'::text,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT karyawan_pkey PRIMARY KEY (id),
  CONSTRAINT karyawan_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.kasir_fcm_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type = ANY (ARRAY['profile'::text, 'karyawan'::text])),
  toko_id uuid NOT NULL,
  fcm_token text NOT NULL,
  device_type text DEFAULT 'unknown'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kasir_fcm_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT kasir_fcm_tokens_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.kategori (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  toko_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kategori_pkey PRIMARY KEY (id),
  CONSTRAINT kategori_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.kitchen_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  source_type text NOT NULL CHECK (source_type = ANY (ARRAY['walk_in'::text, 'online'::text, 'flashsale'::text])),
  source_id uuid NOT NULL,
  order_number text NOT NULL,
  table_number text,
  customer_name text,
  customer_phone text,
  customer_email text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text])),
  priority integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  kitchen_notes text,
  total_amount integer NOT NULL,
  subtotal integer NOT NULL,
  admin_fee integer DEFAULT 1000,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT kitchen_queue_pkey PRIMARY KEY (id),
  CONSTRAINT kitchen_queue_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.kitchen_queue_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kitchen_queue_id uuid NOT NULL,
  menu_id uuid,
  menu_name text NOT NULL,
  variasi_name text,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'out'::text])),
  is_out boolean DEFAULT false,
  out_at timestamp with time zone,
  item_notes text,
  discount_percentage integer DEFAULT 0,
  total_discount integer DEFAULT 0,
  CONSTRAINT kitchen_queue_items_pkey PRIMARY KEY (id),
  CONSTRAINT kitchen_queue_items_kitchen_queue_id_fkey FOREIGN KEY (kitchen_queue_id) REFERENCES public.kitchen_queue(id)
);
CREATE TABLE public.license_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['created'::text, 'extended'::text, 'expired'::text, 'suspended'::text, 'reactivated'::text])),
  license_type text NOT NULL,
  duration_months integer NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT license_history_pkey PRIMARY KEY (id),
  CONSTRAINT license_history_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.license_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  notification_type text NOT NULL CHECK (notification_type = ANY (ARRAY['expiring_soon'::text, 'expired'::text, 'transaction_limit'::text])),
  message text NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  CONSTRAINT license_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT license_notifications_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.menu (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  harga integer NOT NULL,
  toko_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  kategori_id uuid,
  image_url text,
  image_path text,
  image_updated_at timestamp with time zone DEFAULT now(),
  discount_percentage integer DEFAULT 0,
  stock_enabled boolean DEFAULT false,
  stock_quantity integer DEFAULT 0,
  stock_alert_threshold integer DEFAULT 5,
  CONSTRAINT menu_pkey PRIMARY KEY (id),
  CONSTRAINT menu_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id),
  CONSTRAINT menu_kategori_id_fkey FOREIGN KEY (kategori_id) REFERENCES public.kategori(id)
);
CREATE TABLE public.menu_variasi (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  nama text NOT NULL,
  harga_tambahan integer NOT NULL DEFAULT 0,
  menu_id uuid NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  CONSTRAINT menu_variasi_pkey PRIMARY KEY (id),
  CONSTRAINT menu_variasi_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu(id)
);
CREATE TABLE public.open_bill_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  open_bill_id uuid NOT NULL,
  menu_id uuid,
  variasi_id uuid,
  menu_name text NOT NULL,
  variasi_name text,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  notes text,
  discount_percentage integer DEFAULT 0,
  harga_asli integer DEFAULT 0,
  total_discount integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT open_bill_items_pkey PRIMARY KEY (id),
  CONSTRAINT open_bill_items_open_bill_id_fkey FOREIGN KEY (open_bill_id) REFERENCES public.open_bills(id)
);
CREATE TABLE public.open_bills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  user_id uuid NOT NULL,
  bill_number text NOT NULL,
  customer_name text,
  customer_phone text,
  table_number text,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'closed'::text, 'cancelled'::text])),
  subtotal integer NOT NULL DEFAULT 0,
  admin_fee integer NOT NULL DEFAULT 1000,
  total_amount integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  transaksi_id uuid,
  pelanggan_id uuid,
  is_anonymous boolean DEFAULT false,
  customer_type text DEFAULT 'registered'::text CHECK (customer_type = ANY (ARRAY['registered'::text, 'anonymous'::text])),
  global_discount_amount integer DEFAULT 0,
  global_discount_percentage integer DEFAULT 0,
  CONSTRAINT open_bills_pkey PRIMARY KEY (id),
  CONSTRAINT open_bills_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id),
  CONSTRAINT open_bills_pelanggan_id_fkey FOREIGN KEY (pelanggan_id) REFERENCES public.pelanggan(id),
  CONSTRAINT open_bills_transaksi_id_fkey FOREIGN KEY (transaksi_id) REFERENCES public.transaksi(id)
);
CREATE TABLE public.pelanggan (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  no_hp text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  toko_id uuid NOT NULL,
  last_transaction_date timestamp with time zone,
  last_reminder_date timestamp with time zone,
  reminder_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  CONSTRAINT pelanggan_pkey PRIMARY KEY (id),
  CONSTRAINT pelanggan_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.pesanan_online (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  table_number text,
  order_notes text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'paid'::text, 'cancelled'::text])),
  total_amount integer NOT NULL,
  subtotal integer NOT NULL,
  admin_fee integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone,
  transaksi_id uuid,
  pelanggan_id uuid,
  is_anonymous boolean DEFAULT false,
  customer_type text DEFAULT 'online'::text CHECK (customer_type = ANY (ARRAY['online'::text, 'walk_in'::text])),
  global_discount_amount integer DEFAULT 0,
  global_discount_percentage integer DEFAULT 0,
  session_token text,
  session_id uuid,
  CONSTRAINT pesanan_online_pkey PRIMARY KEY (id),
  CONSTRAINT pesanan_online_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id),
  CONSTRAINT pesanan_online_transaksi_id_fkey FOREIGN KEY (transaksi_id) REFERENCES public.transaksi(id),
  CONSTRAINT pesanan_online_pelanggan_id_fkey FOREIGN KEY (pelanggan_id) REFERENCES public.pelanggan(id)
);
CREATE TABLE public.pesanan_online_detail (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pesanan_online_id uuid NOT NULL,
  menu_id uuid,
  variasi_id uuid,
  menu_name text NOT NULL,
  variasi_name text,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  notes text,
  discount_percentage integer DEFAULT 0,
  harga_asli integer DEFAULT 0,
  total_discount integer DEFAULT 0,
  CONSTRAINT pesanan_online_detail_pkey PRIMARY KEY (id),
  CONSTRAINT pesanan_online_detail_pesanan_online_id_fkey FOREIGN KEY (pesanan_online_id) REFERENCES public.pesanan_online(id),
  CONSTRAINT pesanan_online_detail_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu(id),
  CONSTRAINT pesanan_online_detail_variasi_id_fkey FOREIGN KEY (variasi_id) REFERENCES public.menu_variasi(id)
);
CREATE TABLE public.pickup_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  toko_id uuid NOT NULL,
  pickup_code text NOT NULL UNIQUE,
  pickup_instructions text,
  is_used boolean DEFAULT false,
  valid_until timestamp with time zone NOT NULL,
  email_sent boolean DEFAULT false,
  email_sent_at timestamp with time zone,
  used_at timestamp with time zone,
  used_by_karyawan_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pickup_codes_pkey PRIMARY KEY (id),
  CONSTRAINT pickup_codes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.flashsale_orders(id),
  CONSTRAINT pickup_codes_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id),
  CONSTRAINT pickup_codes_used_by_karyawan_id_fkey FOREIGN KEY (used_by_karyawan_id) REFERENCES public.karyawan(id)
);
CREATE TABLE public.profile (
  id uuid NOT NULL,
  email text,
  nama text,
  toko_id uuid,
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT profile_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profile_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.toko (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama_toko text,
  created_at timestamp with time zone DEFAULT now(),
  ai_prompt_preset text,
  ai_prompt_custom text,
  social_media text,
  whatsapp_number text,
  license_start timestamp with time zone DEFAULT now(),
  license_end timestamp with time zone DEFAULT (now() + '10 years'::interval),
  license_status text DEFAULT 'active'::text CHECK (license_status = ANY (ARRAY['active'::text, 'expired'::text, 'suspended'::text])),
  license_type text DEFAULT 'trial'::text CHECK (license_type = ANY (ARRAY['trial'::text, 'monthly'::text, 'yearly'::text])),
  transaction_count integer DEFAULT 0,
  last_license_notification timestamp with time zone,
  gmaps_link text,
  global_discount_percentage integer DEFAULT 0,
  global_discount_enabled boolean DEFAULT false,
  reminder_voucher_id uuid,
  biaya_admin integer DEFAULT 1000,
  admin_price_special boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT toko_pkey PRIMARY KEY (id),
  CONSTRAINT toko_reminder_voucher_id_fkey FOREIGN KEY (reminder_voucher_id) REFERENCES public.voucher(id)
);
CREATE TABLE public.toko_admin_fee_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  old_biaya_admin integer,
  new_biaya_admin integer,
  old_admin_price_special boolean,
  new_admin_price_special boolean,
  changed_by uuid,
  changed_at timestamp with time zone DEFAULT now(),
  change_reason text,
  CONSTRAINT toko_admin_fee_audit_pkey PRIMARY KEY (id),
  CONSTRAINT toko_admin_fee_audit_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.transaksi (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  user_id uuid NOT NULL,
  total integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  nama_pembeli character varying,
  no_hp_pembeli character varying,
  pelanggan_id uuid,
  pesan text,
  is_anonymous boolean DEFAULT false,
  customer_type text DEFAULT 'registered'::text CHECK (customer_type = ANY (ARRAY['registered'::text, 'anonymous'::text])),
  subtotal integer NOT NULL DEFAULT 0,
  admin_fee integer NOT NULL DEFAULT 1000,
  order_type text DEFAULT 'walk_in'::text CHECK (order_type = ANY (ARRAY['walk_in'::text, 'online'::text])),
  global_discount_amount integer DEFAULT 0,
  global_discount_percentage integer DEFAULT 0,
  CONSTRAINT transaksi_pkey PRIMARY KEY (id),
  CONSTRAINT transaksi_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id),
  CONSTRAINT transaksi_pelanggan_id_fkey FOREIGN KEY (pelanggan_id) REFERENCES public.pelanggan(id)
);
CREATE TABLE public.transaksi_detail (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaksi_id uuid NOT NULL,
  menu_id uuid,
  qty integer NOT NULL,
  harga_satuan integer NOT NULL,
  variasi_id uuid,
  nama_menu text,
  variasi_nama text,
  discount_percentage integer DEFAULT 0,
  harga_asli integer DEFAULT 0,
  total_discount integer DEFAULT 0,
  CONSTRAINT transaksi_detail_pkey PRIMARY KEY (id),
  CONSTRAINT transaksi_detail_transaksi_id_fkey FOREIGN KEY (transaksi_id) REFERENCES public.transaksi(id),
  CONSTRAINT transaksi_detail_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu(id),
  CONSTRAINT transaksi_detail_variasi_id_fkey FOREIGN KEY (variasi_id) REFERENCES public.menu_variasi(id)
);
CREATE TABLE public.voucher (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  kode_voucher text NOT NULL,
  nama_voucher text NOT NULL,
  potongan_rupiah integer NOT NULL CHECK (potongan_rupiah > 0),
  is_active boolean DEFAULT true,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT voucher_pkey PRIMARY KEY (id),
  CONSTRAINT voucher_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);
CREATE TABLE public.voucher_usage_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL,
  transaksi_id uuid NOT NULL,
  toko_id uuid NOT NULL,
  kode_voucher text NOT NULL,
  nilai_potongan integer NOT NULL,cree
  total_sebelum_potongan integer NOT NULL,
  total_setelah_potongan integer NOT NULL,
  used_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT voucher_usage_history_pkey PRIMARY KEY (id),
  CONSTRAINT voucher_usage_history_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.voucher(id),
  CONSTRAINT voucher_usage_history_transaksi_id_fkey FOREIGN KEY (transaksi_id) REFERENCES public.transaksi(id),
  CONSTRAINT voucher_usage_history_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);