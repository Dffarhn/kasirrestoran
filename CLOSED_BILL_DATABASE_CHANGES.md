# 🗄️ Closed Bill - Database Changes Documentation

## 🎯 Overview

Dokumentasi ini menjelaskan **perubahan database** yang terjadi ketika Closed Bill diproses, untuk integrasi langsung dengan POS kasir tanpa melalui web customer.

## 📊 Database Changes Flow

### **BEFORE Closed Bill:**
```sql
-- Session status: active
customer_sessions.status = 'active'

-- Orders status: pending
pesanan_online.status = 'pending'
```

### **AFTER Closed Bill:**
```sql
-- Session status: closed
customer_sessions.status = 'closed'
customer_sessions.closed_at = NOW()

-- Orders status: tetap pending (akan diubah oleh POS)
pesanan_online.status = 'pending' (belum berubah)
```

## 🔄 Database Operations

### **1. Session Closure (Automatic)**
```sql
-- Function yang dipanggil saat Close Bill
UPDATE customer_sessions 
SET 
  status = 'closed',
  closed_at = NOW(),
  last_activity_at = NOW()
WHERE session_token = 'sess_xxxxx' 
AND status = 'active';
```

### **2. Order Status Updates (Manual by POS)**
```sql
-- POS akan mengubah status orders
UPDATE pesanan_online 
SET 
  status = 'paid',           -- atau 'processing'
  payment_method = 'cash',  -- atau 'card', 'qris', dll
  payment_reference = 'PAY-001',
  paid_at = NOW()
WHERE session_token = 'sess_xxxxx';

-- Update detail items jika perlu
UPDATE pesanan_online_detail 
SET 
  status = 'paid'
WHERE pesanan_online_id IN (
  SELECT id FROM pesanan_online 
  WHERE session_token = 'sess_xxxxx'
);
```

### **3. Final Completion (Manual by POS)**
```sql
-- Setelah pembayaran selesai
UPDATE pesanan_online 
SET status = 'completed',
    completed_at = NOW()
WHERE session_token = 'sess_xxxxx';

-- Update session final status
UPDATE customer_sessions 
SET 
  status = 'completed',
  payment_completed_at = NOW()
WHERE session_token = 'sess_xxxxx';
```

## 🛠️ API Endpoints untuk POS

### **1. Get Closed Session Data**
```http
GET /api/sessions/{sessionToken}/closed
```

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "session_token": "sess_xxxxx",
    "table_number": "5",
    "customer_name": "John Doe",
    "customer_phone": "+6281234567890",
    "status": "closed",
    "total_session_amount": 150000,
    "closed_at": "2024-01-15T10:30:00Z"
  },
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-001",
      "total_amount": 75000,
      "status": "pending",
      "items": [
        {
          "menu_name": "Nasi Goreng",
          "quantity": 2,
          "price": 25000,
          "subtotal": 50000
        }
      ]
    }
  ],
  "total_amount": 150000
}
```

### **2. Update Order Payment Status**
```http
PUT /api/sessions/{sessionToken}/payment
```

**Request Body:**
```json
{
  "payment_method": "cash",
  "payment_reference": "PAY-001",
  "paid_amount": 150000,
  "change_amount": 0
}
```

**Database Changes:**
```sql
UPDATE pesanan_online 
SET 
  status = 'paid',
  payment_method = 'cash',
  payment_reference = 'PAY-001',
  paid_amount = 150000,
  paid_at = NOW()
WHERE session_token = 'sess_xxxxx';
```

### **3. Complete Payment**
```http
POST /api/sessions/{sessionToken}/complete
```

**Database Changes:**
```sql
-- Mark orders as completed
UPDATE pesanan_online 
SET 
  status = 'completed',
  completed_at = NOW()
WHERE session_token = 'sess_xxxxx';

-- Update session final status
UPDATE customer_sessions 
SET 
  status = 'completed',
  payment_completed_at = NOW()
WHERE session_token = 'sess_xxxxx';
```

## 📋 Database Schema Changes

### **New Columns Needed:**

#### **pesanan_online table:**
```sql
ALTER TABLE pesanan_online ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE pesanan_online ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE pesanan_online ADD COLUMN IF NOT EXISTS paid_amount integer;
ALTER TABLE pesanan_online ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;
ALTER TABLE pesanan_online ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
```

#### **customer_sessions table:**
```sql
ALTER TABLE customer_sessions ADD COLUMN IF NOT EXISTS payment_completed_at timestamp with time zone;
ALTER TABLE customer_sessions ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE customer_sessions ADD COLUMN IF NOT EXISTS payment_reference text;
```

## 🔍 Database Queries untuk POS

### **1. Get All Closed Sessions (POS Dashboard)**
```sql
SELECT 
  cs.id,
  cs.session_token,
  cs.table_number,
  cs.customer_name,
  cs.customer_phone,
  cs.total_session_amount,
  cs.closed_at,
  COUNT(po.id) as order_count
FROM customer_sessions cs
LEFT JOIN pesanan_online po ON cs.session_token = po.session_token
WHERE cs.status = 'closed'
  AND cs.closed_at >= CURRENT_DATE
ORDER BY cs.closed_at DESC;
```

### **2. Get Session Details for Payment**
```sql
SELECT 
  cs.*,
  po.id as order_id,
  po.order_number,
  po.total_amount,
  po.status as order_status,
  pod.menu_name,
  pod.quantity,
  pod.price,
  pod.subtotal
FROM customer_sessions cs
JOIN pesanan_online po ON cs.session_token = po.session_token
LEFT JOIN pesanan_online_detail pod ON po.id = pod.pesanan_online_id
WHERE cs.session_token = 'sess_xxxxx'
ORDER BY po.created_at, pod.created_at;
```

### **3. Update Payment Status (Batch)**
```sql
-- Update all orders in session
UPDATE pesanan_online 
SET 
  status = 'paid',
  payment_method = 'cash',
  payment_reference = 'PAY-001',
  paid_at = NOW()
WHERE session_token = 'sess_xxxxx'
  AND status = 'pending';

-- Update session
UPDATE customer_sessions 
SET 
  payment_method = 'cash',
  payment_reference = 'PAY-001'
WHERE session_token = 'sess_xxxxx';
```

## 🚀 POS Integration Flow

### **Step 1: POS Receives Closed Session**
```javascript
// POS polls for closed sessions
const closedSessions = await supabase
  .from('customer_sessions')
  .select('*')
  .eq('status', 'closed')
  .order('closed_at', { ascending: false });
```

### **Step 2: POS Processes Payment**
```javascript
// Update payment status
await supabase
  .from('pesanan_online')
  .update({
    status: 'paid',
    payment_method: 'cash',
    payment_reference: 'PAY-001',
    paid_at: new Date().toISOString()
  })
  .eq('session_token', sessionToken);
```

### **Step 3: POS Completes Transaction**
```javascript
// Mark as completed
await supabase
  .from('pesanan_online')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('session_token', sessionToken);

// Update session
await supabase
  .from('customer_sessions')
  .update({
    status: 'completed',
    payment_completed_at: new Date().toISOString()
  })
  .eq('session_token', sessionToken);
```

## 📊 Status Flow Diagram

```
Customer App                    Database                    POS System
┌─────────────┐                ┌─────────────┐            ┌─────────────┐
│ Close Bill  │ ──────────────► │ status:    │ ◄─────────── │ Poll for    │
│             │                │ 'closed'   │             │ closed      │
└─────────────┘                └─────────────┘            │ sessions    │
                                                           └─────────────┘
                                                                    │
                                                                    ▼
                                                           ┌─────────────┐
                                                           │ Process     │
                                                           │ Payment     │
                                                           └─────────────┘
                                                                    │
                                                                    ▼
                                                           ┌─────────────┐
                                                           │ Update      │
                                                           │ status:     │
                                                           │ 'paid'      │
                                                           └─────────────┘
                                                                    │
                                                                    ▼
                                                           ┌─────────────┐
                                                           │ Complete    │
                                                           │ status:     │
                                                           │ 'completed' │
                                                           └─────────────┘
```

## 🔐 Security & Permissions

### **Row Level Security (RLS)**
```sql
-- Allow POS to access closed sessions
CREATE POLICY "POS can access closed sessions" ON customer_sessions
  FOR SELECT USING (status = 'closed');

-- Allow POS to update orders
CREATE POLICY "POS can update orders" ON pesanan_online
  FOR UPDATE USING (session_token IN (
    SELECT session_token FROM customer_sessions 
    WHERE status = 'closed'
  ));
```

### **API Authentication**
```javascript
// POS needs to authenticate
const { data, error } = await supabase
  .from('customer_sessions')
  .select('*')
  .eq('session_token', sessionToken)
  .eq('status', 'closed');
```

## 📈 Monitoring Queries

### **Daily Closed Sessions**
```sql
SELECT 
  DATE(closed_at) as date,
  COUNT(*) as sessions,
  SUM(total_session_amount) as total_revenue
FROM customer_sessions 
WHERE status = 'closed'
  AND closed_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(closed_at)
ORDER BY date DESC;
```

### **Pending Payments**
```sql
SELECT 
  cs.session_token,
  cs.table_number,
  cs.customer_name,
  cs.total_session_amount,
  cs.closed_at,
  COUNT(po.id) as pending_orders
FROM customer_sessions cs
JOIN pesanan_online po ON cs.session_token = po.session_token
WHERE cs.status = 'closed'
  AND po.status = 'pending'
GROUP BY cs.session_token, cs.table_number, cs.customer_name, cs.total_session_amount, cs.closed_at
ORDER BY cs.closed_at ASC;
```

## 🎯 Implementation Checklist

### **Database Setup:**
- [ ] Add new columns to `pesanan_online`
- [ ] Add new columns to `customer_sessions`
- [ ] Create RLS policies for POS access
- [ ] Create indexes for performance
- [ ] Test database operations

### **POS Integration:**
- [ ] Implement session polling
- [ ] Add payment processing
- [ ] Create status update functions
- [ ] Add error handling
- [ ] Test with real data

### **Monitoring:**
- [ ] Set up payment tracking
- [ ] Create dashboard queries
- [ ] Add alerting for failed payments
- [ ] Monitor performance metrics

---

*Dokumentasi ini fokus pada perubahan database dan integrasi POS tanpa melalui web customer.*
