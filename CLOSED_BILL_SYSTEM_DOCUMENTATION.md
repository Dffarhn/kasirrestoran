# 📋 Closed Bill System Documentation

## 🎯 Overview

Sistem Closed Bill adalah fitur untuk mengakhiri session customer dan menyiapkan data untuk pembayaran. Sistem ini dirancang untuk diintegrasikan dengan aplikasi lain (seperti POS kasir) untuk memproses pembayaran.

## 🏗️ Architecture Overview

```
Customer App (This App)          External POS App
┌─────────────────────┐         ┌─────────────────────┐
│ 1. Close Bill      │ ──────► │ 3. Process Payment │
│ 2. Generate Data   │         │ 4. Update Status    │
└─────────────────────┘         └─────────────────────┘
           │                              │
           ▼                              ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │ Database Session   │         │ Payment Gateway     │
    │ - Mark as closed   │         │ - Process payment   │
    │ - Generate token │         │ - Update order      │
    └─────────────────────┘         └─────────────────────┘
```

## 📊 Database Schema

### 1. **customer_sessions** Table
```sql
CREATE TABLE customer_sessions (
  id uuid PRIMARY KEY,
  session_token text UNIQUE NOT NULL,
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
  last_activity_at timestamp with time zone DEFAULT now()
);
```

### 2. **pesanan_online** Table (Enhanced)
```sql
-- Additional columns for session linkage
ALTER TABLE pesanan_online ADD COLUMN session_token text;
ALTER TABLE pesanan_online ADD COLUMN session_id uuid;
```

## 🔄 Closed Bill Flow

### **Phase 1: Customer Initiates Close Bill**

1. **Customer clicks "Close Bill" button** in header
2. **Modal confirmation** appears with session summary
3. **Customer confirms** to proceed with close bill

### **Phase 2: Data Preparation & Session Closure**

```javascript
// 1. Prepare summary data
const summaryData = {
  sessionId: session?.id,
  sessionToken: session?.session_token,
  tableNumber: session?.table_number,
  customerName: session?.customer_name,
  customerPhone: session?.customer_phone,
  orders: sessionOrders,
  totalAmount: sessionTotal,
  closedAt: new Date().toISOString()
};

// 2. Close session in database
await closeSession(sessionToken);

// 3. Store data for external app access
localStorage.setItem('close_bill_summary', JSON.stringify(summaryData));
localStorage.setItem('closed_session_token', summaryData.sessionToken);
```

### **Phase 3: External App Integration**

#### **A. Data Access Methods**

**Method 1: Direct Database Access**
```sql
-- Get closed session data
SELECT * FROM customer_sessions 
WHERE session_token = 'sess_xxxxx' 
AND status = 'closed';

-- Get all orders in session
SELECT po.*, pod.* 
FROM pesanan_online po
LEFT JOIN pesanan_online_detail pod ON po.id = pod.pesanan_online_id
WHERE po.session_token = 'sess_xxxxx'
ORDER BY po.created_at ASC;
```

**Method 2: RPC Function**
```sql
-- Use existing RPC function
SELECT * FROM get_session_orders_summary('sess_xxxxx');
```

**Method 3: API Endpoint (Recommended)**
```javascript
// GET /api/session/{sessionToken}/summary
{
  "session": {
    "id": "uuid",
    "session_token": "sess_xxxxx",
    "table_number": "5",
    "customer_name": "John Doe",
    "customer_phone": "+6281234567890",
    "total_session_amount": 150000,
    "closed_at": "2024-01-15T10:30:00Z"
  },
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-001",
      "total_amount": 75000,
      "status": "pending",
      "created_at": "2024-01-15T10:00:00Z",
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

## 🔧 Implementation Guide for External App

### **Step 1: Database Connection**
```javascript
// Connect to same Supabase instance
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
```

### **Step 2: Get Closed Session Data**
```javascript
async function getClosedSessionData(sessionToken) {
  // Method 1: Direct query
  const { data: session } = await supabase
    .from('customer_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('status', 'closed')
    .single();

  const { data: orders } = await supabase
    .from('pesanan_online')
    .select(`
      *,
      pesanan_online_detail(*)
    `)
    .eq('session_token', sessionToken)
    .order('created_at', { ascending: true });

  return { session, orders };
}
```

### **Step 3: Process Payment**
```javascript
async function processPayment(sessionToken, paymentData) {
  // 1. Update order status to 'paid'
  const { error: updateError } = await supabase
    .from('pesanan_online')
    .update({ 
      status: 'paid',
      payment_method: paymentData.method,
      payment_reference: paymentData.reference,
      paid_at: new Date().toISOString()
    })
    .eq('session_token', sessionToken);

  if (updateError) throw updateError;

  // 2. Update session status to 'paid'
  const { error: sessionError } = await supabase
    .from('customer_sessions')
    .update({ 
      status: 'paid',
      payment_completed_at: new Date().toISOString()
    })
    .eq('session_token', sessionToken);

  if (sessionError) throw sessionError;

  return true;
}
```

### **Step 4: Handle Payment Completion**
```javascript
async function completePayment(sessionToken) {
  // Mark all orders as completed
  const { error } = await supabase
    .from('pesanan_online')
    .update({ status: 'completed' })
    .eq('session_token', sessionToken);

  if (error) throw error;

  // Update session final status
  await supabase
    .from('customer_sessions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('session_token', sessionToken);

  return true;
}
```

## 📱 User Interface Flow

### **Customer App (This App)**
1. **Header Button**: "Close Bill" button appears when session exists
2. **Modal Confirmation**: Shows session summary and total amount
3. **Confirmation**: Customer confirms to close bill
4. **Redirect**: Redirects to summary page with payment instructions

### **External POS App**
1. **Receive Data**: Get session data via API or direct DB access
2. **Display Summary**: Show order details and total amount
3. **Process Payment**: Handle payment through POS system
4. **Update Status**: Mark orders as paid/completed
5. **Print Receipt**: Generate receipt for customer

## 🔐 Security Considerations

### **Session Token Security**
- Session tokens are unique and time-limited
- Tokens expire after 4 hours of inactivity
- Only active sessions can be closed
- Closed sessions cannot be reopened

### **Data Access Control**
```sql
-- Row Level Security (RLS) policies
CREATE POLICY "Allow session access" ON customer_sessions
  FOR SELECT USING (toko_id = current_setting('app.current_toko_id')::uuid);

CREATE POLICY "Allow order access" ON pesanan_online
  FOR SELECT USING (toko_id = current_setting('app.current_toko_id')::uuid);
```

## 📊 Data Structure Examples

### **Session Data**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "session_token": "sess_abc123def456",
  "toko_id": "456e7890-e89b-12d3-a456-426614174001",
  "table_number": "5",
  "customer_name": "John Doe",
  "customer_phone": "+6281234567890",
  "status": "closed",
  "total_session_amount": 150000,
  "closed_at": "2024-01-15T10:30:00Z"
}
```

### **Order Data**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "order_number": "ORD-001",
  "session_token": "sess_abc123def456",
  "total_amount": 75000,
  "status": "pending",
  "items": [
    {
      "menu_name": "Nasi Goreng",
      "quantity": 2,
      "price": 25000,
      "subtotal": 50000
    },
    {
      "menu_name": "Es Teh",
      "quantity": 1,
      "price": 5000,
      "subtotal": 5000
    }
  ]
}
```

## 🚀 Integration Checklist

### **For External POS App:**
- [ ] Connect to same Supabase database
- [ ] Implement session data retrieval
- [ ] Create payment processing logic
- [ ] Add order status updates
- [ ] Implement receipt generation
- [ ] Add error handling
- [ ] Test with real session data

### **For Customer App:**
- [ ] Ensure session data is properly stored
- [ ] Verify session closure works correctly
- [ ] Test summary page display
- [ ] Validate data persistence

## 🔍 Troubleshooting

### **Common Issues:**

1. **Session not found**
   - Check if session token is correct
   - Verify session status is 'closed'
   - Ensure session hasn't expired

2. **Orders not loading**
   - Verify session_token linkage
   - Check order status
   - Ensure proper database permissions

3. **Payment processing fails**
   - Check database connection
   - Verify order status updates
   - Ensure proper error handling

## 📈 Monitoring & Analytics

### **Key Metrics to Track:**
- Number of closed sessions per day
- Average session amount
- Payment processing time
- Failed payment attempts
- Customer satisfaction

### **Database Queries for Analytics:**
```sql
-- Daily closed sessions
SELECT DATE(closed_at) as date, COUNT(*) as sessions
FROM customer_sessions 
WHERE status = 'closed' 
GROUP BY DATE(closed_at);

-- Average session amount
SELECT AVG(total_session_amount) as avg_amount
FROM customer_sessions 
WHERE status = 'closed';
```

## 🎯 Best Practices

1. **Always validate session token** before processing
2. **Implement proper error handling** for all operations
3. **Use transactions** for payment processing
4. **Log all payment activities** for audit trail
5. **Implement retry logic** for failed operations
6. **Test thoroughly** with real data scenarios

---

*This documentation provides a complete guide for implementing the Closed Bill system integration with external POS applications.*
