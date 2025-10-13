-- =====================================================
-- KITCHEN QUEUE SYSTEM - SUPABASE SCHEMA
-- =====================================================
-- Schema untuk sistem antrian dapur yang terintegrasi
-- dengan database existing (transaksi, pesanan_online, flashsale_orders)
-- =====================================================

-- 1. TABEL UTAMA - KITCHEN QUEUE
-- =====================================================
CREATE TABLE public.kitchen_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  
  -- Source tracking (untuk integrasi dengan sistem existing)
  source_type text NOT NULL CHECK (source_type = ANY (ARRAY['walk_in'::text, 'online'::text, 'flashsale'::text])),
  source_id uuid NOT NULL, -- ID dari transaksi/pesanan_online/flashsale_orders
  
  -- Order info (snapshot data)
  order_number text NOT NULL,
  table_number text,
  customer_name text,
  customer_phone text,
  customer_email text,
  
  -- Kitchen status (sederhana)
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text])),
  priority integer DEFAULT 1,
  
  -- Timing
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  
  -- Kitchen management
  kitchen_notes text,
  
  -- Order totals (snapshot)
  total_amount integer NOT NULL,
  subtotal integer NOT NULL,
  admin_fee integer DEFAULT 1000,
  
  CONSTRAINT kitchen_queue_pkey PRIMARY KEY (id),
  CONSTRAINT kitchen_queue_toko_id_fkey FOREIGN KEY (toko_id) REFERENCES public.toko(id)
);

-- Index untuk performance
CREATE INDEX idx_kitchen_queue_toko_id ON kitchen_queue(toko_id);
CREATE INDEX idx_kitchen_queue_status ON kitchen_queue(status);
CREATE INDEX idx_kitchen_queue_created_at ON kitchen_queue(created_at);
CREATE INDEX idx_kitchen_queue_source ON kitchen_queue(source_type, source_id);

-- =====================================================
-- 2. TABEL DETAIL ITEMS - KITCHEN QUEUE ITEMS
-- =====================================================
CREATE TABLE public.kitchen_queue_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kitchen_queue_id uuid NOT NULL,
  
  -- Item info (snapshot data - tidak ada foreign key ke menu)
  menu_id uuid, -- Reference saja, boleh null
  menu_name text NOT NULL,
  variasi_name text,
  quantity integer NOT NULL,
  unit_price integer NOT NULL, -- Snapshot harga saat pesanan
  
  -- Kitchen status per item (sederhana)
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'out'::text])),
  is_out boolean DEFAULT false,
  
  -- Timing per item
  out_at timestamp with time zone,
  
  -- Item details
  item_notes text,
  discount_percentage integer DEFAULT 0,
  total_discount integer DEFAULT 0,
  
  CONSTRAINT kitchen_queue_items_pkey PRIMARY KEY (id),
  CONSTRAINT kitchen_queue_items_kitchen_queue_id_fkey 
    FOREIGN KEY (kitchen_queue_id) REFERENCES public.kitchen_queue(id) ON DELETE CASCADE
  -- TIDAK ADA foreign key ke menu(id) untuk mencegah data corruption
);

-- Index untuk performance
CREATE INDEX idx_kitchen_queue_items_kitchen_queue_id ON kitchen_queue_items(kitchen_queue_id);
CREATE INDEX idx_kitchen_queue_items_status ON kitchen_queue_items(status);
CREATE INDEX idx_kitchen_queue_items_menu_id ON kitchen_queue_items(menu_id); -- Index saja, bukan constraint
CREATE INDEX idx_kitchen_queue_items_out_status ON kitchen_queue_items(is_out, status);

-- =====================================================
-- 3. FUNCTIONS UNTUK KITCHEN QUEUE MANAGEMENT
-- =====================================================

-- Function untuk membuat kitchen queue dari pesanan
CREATE OR REPLACE FUNCTION create_kitchen_queue(
  p_toko_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_order_number text,
  p_customer_name text,
  p_customer_phone text,
  p_total_amount integer,
  p_subtotal integer
) RETURNS uuid AS $$
DECLARE
  v_kitchen_queue_id uuid;
BEGIN
  -- Insert ke kitchen_queue
  INSERT INTO kitchen_queue (
    toko_id, source_type, source_id, order_number,
    customer_name, customer_phone, total_amount, subtotal
  ) VALUES (
    p_toko_id, p_source_type, p_source_id, p_order_number,
    p_customer_name, p_customer_phone, p_total_amount, p_subtotal
  ) RETURNING id INTO v_kitchen_queue_id;
  
  RETURN v_kitchen_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function untuk menambah items ke kitchen queue
CREATE OR REPLACE FUNCTION add_kitchen_queue_items(
  p_kitchen_queue_id uuid,
  p_menu_id uuid,
  p_menu_name text,
  p_variasi_name text,
  p_quantity integer,
  p_unit_price integer,
  p_discount_percentage integer DEFAULT 0,
  p_total_discount integer DEFAULT 0
) RETURNS void AS $$
BEGIN
  INSERT INTO kitchen_queue_items (
    kitchen_queue_id, menu_id, menu_name, variasi_name,
    quantity, unit_price, discount_percentage, total_discount
  ) VALUES (
    p_kitchen_queue_id, p_menu_id, p_menu_name, p_variasi_name,
    p_quantity, p_unit_price, p_discount_percentage, p_total_discount
  );
END;
$$ LANGUAGE plpgsql;

-- Function untuk update status item (sederhana)
CREATE OR REPLACE FUNCTION update_kitchen_item_out(
  p_item_id uuid,
  p_is_out boolean
) RETURNS void AS $$
DECLARE
  v_kitchen_queue_id uuid;
  v_all_items_out boolean;
BEGIN
  -- Update item status
  UPDATE kitchen_queue_items 
  SET 
    status = CASE WHEN p_is_out THEN 'out' ELSE 'pending' END,
    is_out = p_is_out,
    out_at = CASE WHEN p_is_out THEN now() ELSE NULL END
  WHERE id = p_item_id;
  
  -- Get kitchen_queue_id
  SELECT kitchen_queue_id INTO v_kitchen_queue_id 
  FROM kitchen_queue_items WHERE id = p_item_id;
  
  -- Check if all items are out
  SELECT NOT EXISTS (
    SELECT 1 FROM kitchen_queue_items 
    WHERE kitchen_queue_id = v_kitchen_queue_id AND is_out = false
  ) INTO v_all_items_out;
  
  -- Update kitchen queue status if all items are out
  IF v_all_items_out THEN
    UPDATE kitchen_queue 
    SET status = 'completed', completed_at = now()
    WHERE id = v_kitchen_queue_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. VIEWS UNTUK FRONTEND
-- =====================================================

-- View untuk dashboard dapur
CREATE VIEW kitchen_dashboard_view AS
SELECT 
  kq.id,
  kq.toko_id,
  kq.source_type,
  kq.source_id,
  kq.order_number,
  kq.table_number,
  kq.customer_name,
  kq.customer_phone,
  kq.status as order_status,
  kq.priority,
  kq.created_at,
  kq.completed_at,
  kq.kitchen_notes,
  kq.total_amount,
  kq.subtotal,
  
  -- Item summary
  COUNT(kqi.id) as total_items,
  COUNT(CASE WHEN kqi.is_out = true THEN 1 END) as items_out,
  COUNT(CASE WHEN kqi.is_out = false THEN 1 END) as items_pending,
  
  -- Progress percentage
  CASE 
    WHEN COUNT(kqi.id) = 0 THEN 0
    ELSE ROUND((COUNT(CASE WHEN kqi.is_out = true THEN 1 END)::numeric / COUNT(kqi.id)) * 100, 2)
  END as progress_percentage,
  
  -- Urgency (berdasarkan waktu)
  CASE 
    WHEN kq.created_at < now() - interval '20 minutes' THEN 'urgent'
    WHEN kq.created_at < now() - interval '10 minutes' THEN 'warning'
    ELSE 'normal'
  END as urgency_level
  
FROM kitchen_queue kq
LEFT JOIN kitchen_queue_items kqi ON kq.id = kqi.kitchen_queue_id
WHERE kq.status != 'completed'
GROUP BY kq.id, kq.toko_id, kq.source_type, kq.source_id, kq.order_number, 
         kq.table_number, kq.customer_name, kq.customer_phone, kq.status, 
         kq.priority, kq.created_at, kq.completed_at, kq.kitchen_notes, 
         kq.total_amount, kq.subtotal;

-- View untuk items dapur
CREATE VIEW kitchen_items_view AS
SELECT 
  kqi.id,
  kqi.kitchen_queue_id,
  kqi.menu_id,
  kqi.menu_name,
  kqi.variasi_name,
  kqi.quantity,
  kqi.unit_price,
  kqi.status,
  kqi.is_out,
  kqi.out_at,
  kqi.item_notes,
  kqi.discount_percentage,
  kqi.total_discount,
  
  -- Order info
  kq.order_number,
  kq.table_number,
  kq.customer_name,
  kq.priority,
  kq.created_at as order_created_at,
  
  -- Timing calculations
  CASE 
    WHEN kqi.out_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (kqi.out_at - kq.created_at))/60
    ELSE NULL
  END as total_time_minutes
  
FROM kitchen_queue_items kqi
JOIN kitchen_queue kq ON kqi.kitchen_queue_id = kq.id
WHERE kq.status != 'completed';
