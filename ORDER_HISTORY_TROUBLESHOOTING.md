# 🔧 Order History Troubleshooting Guide

## 🎯 Masalah: Detail Pesanan Tidak Muncul

### **Kemungkinan Penyebab:**

1. **Data Detail Items Tidak Tersimpan**
   - Tabel `pesanan_online_detail` kosong
   - Data tidak tersimpan saat checkout

2. **Session Orders Kosong**
   - Session tidak aktif
   - Data session tidak dimuat dengan benar

3. **Database Connection Issues**
   - Supabase connection error
   - RLS policies blocking access

## 🔍 Debug Steps

### **Step 1: Check Console Logs**
```javascript
// Buka Developer Tools (F12)
// Lihat Console untuk log berikut:
console.log('Loading order details for orders:', sessionOrders);
console.log(`Loading details for order ${order.id}`);
console.log(`Order ${order.id} items:`, items);
```

### **Step 2: Check Database Data**
```sql
-- Check if order details exist
SELECT * FROM pesanan_online_detail 
WHERE pesanan_online_id = 'your-order-id';

-- Check session orders
SELECT * FROM pesanan_online 
WHERE session_token = 'your-session-token';
```

### **Step 3: Check Session Context**
```javascript
// In browser console:
console.log('Session:', session);
console.log('Session Orders:', sessionOrders);
console.log('Session Total:', sessionTotal);
```

## 🛠️ Solutions

### **Solution 1: Fix Data Loading**
Jika data detail tidak tersimpan, pastikan saat checkout data tersimpan dengan benar:

```javascript
// Check createPesananOnline function
// Ensure it saves to pesanan_online_detail table
```

### **Solution 2: Add Fallback Data**
Jika detail tidak tersedia, tampilkan informasi pesanan dasar:

```javascript
// OrderHistoryPage.jsx already has fallback
// Shows order number and total amount
```

### **Solution 3: Check Database Schema**
Pastikan tabel `pesanan_online_detail` ada dan memiliki data:

```sql
-- Check table structure
\d pesanan_online_detail;

-- Check if data exists
SELECT COUNT(*) FROM pesanan_online_detail;
```

## 📊 Debug Information

### **Development Mode Debug Panel**
OrderHistoryPage menampilkan debug info di development mode:
- Session Orders count
- Orders with Details count  
- Loading Details status

### **Console Logs to Check:**
1. `Loading order details for orders:` - Shows sessionOrders array
2. `Loading details for order X:` - Shows individual order loading
3. `Order X items:` - Shows items found for each order
4. `All orders with details:` - Shows final result

## 🚀 Quick Fixes

### **Fix 1: Force Reload Session Data**
```javascript
// In browser console:
localStorage.removeItem('session_token');
window.location.reload();
```

### **Fix 2: Check Network Tab**
- Open Network tab in DevTools
- Look for failed requests to Supabase
- Check if RLS policies are blocking access

### **Fix 3: Verify Database Connection**
```javascript
// Test Supabase connection
import { supabase } from './lib/supabase';
const { data, error } = await supabase.from('pesanan_online_detail').select('*').limit(1);
console.log('Connection test:', { data, error });
```

## 📋 Checklist

- [ ] Check console logs for errors
- [ ] Verify session data is loaded
- [ ] Check database has detail records
- [ ] Test Supabase connection
- [ ] Check RLS policies
- [ ] Verify order creation saves details
- [ ] Test with fresh session

## 🎯 Expected Behavior

1. **Session loads** → Shows session info
2. **Orders load** → Shows order cards
3. **Details load** → Shows item details
4. **Fallback** → Shows basic order info if details missing

## 📞 Support

If issues persist:
1. Check browser console for errors
2. Verify database connection
3. Test with fresh session
4. Check RLS policies
5. Verify data is being saved correctly during checkout
