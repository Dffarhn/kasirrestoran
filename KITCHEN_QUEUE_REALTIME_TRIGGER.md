# 🔄 Kitchen Queue Realtime Trigger - Complete Guide

## 📋 Cara Trigger Realtime Kitchen Queue

### **1. Auto-Trigger Saat Pesanan (Sudah Aktif)**

```javascript
// File: src/services/database.js
const createPesananOnline = async (orderData) => {
  try {
    // 1. Simpan pesanan ke database
    const { data: pesanan, error: pesananError } = await supabase
      .from('pesanan_online')
      .insert(pesananData)
      .select()
      .single();

    if (pesananError) throw pesananError;

    // 2. AUTO-CREATE KITCHEN QUEUE (TRIGGER REALTIME)
    await createKitchenQueueFromPesanan(pesanan.id, orderData);
    
    return pesanan;
  } catch (error) {
    console.error('Error creating pesanan:', error);
    throw error;
  }
};

const createKitchenQueueFromPesanan = async (pesananId, orderData) => {
  try {
    // 3. Buat kitchen queue entry
    const { data: kitchenQueue } = await supabase
      .from('kitchen_queue')
      .insert({
        toko_id: orderData.tokoId,
        source_type: 'online',
        source_id: pesananId,
        order_number: 'ORD-' + pesananId,
        customer_name: orderData.customerInfo.name,
        customer_phone: orderData.customerInfo.phone,
        total_amount: orderData.total,
        subtotal: orderData.subtotal
      })
      .select()
      .single();

    // 4. Buat kitchen queue items
    const items = pesanan.pesanan_online_detail.map(item => ({
      kitchen_queue_id: kitchenQueue.id,
      menu_id: item.menu_id,
      menu_name: item.menu_name,
      variasi_name: item.variasi_name,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    await supabase
      .from('kitchen_queue_items')
      .insert(items);

    // 5. REALTIME TRIGGER OTOMATIS!
    // Supabase akan mengirim postgres_changes event ke semua subscriber
    console.log('✅ Kitchen queue created - Realtime triggered!');
    
    return kitchenQueue;
  } catch (error) {
    console.error('❌ Error creating kitchen queue:', error);
    throw error;
  }
};
```

### **2. Manual Trigger dari UI**

```javascript
// File: src/hooks/useKitchenQueue.js
const refresh = useCallback(async () => {
  console.log('🔄 Manual refresh kitchen queue...');
  
  try {
    // Manual fetch data dari database
    const { data, error } = await supabase
      .from('kitchen_queue')
      .select('*, kitchen_queue_items(*)')
      .eq('toko_id', tokoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Update state
    setKitchenOrders(data || []);
    setPendingCount(data?.filter(order => order.status === 'pending').length || 0);
    
    console.log('✅ Manual refresh completed');
  } catch (err) {
    console.error('❌ Manual refresh failed:', err);
  }
}, [tokoId]);
```

### **3. Realtime Subscription (Otomatis)**

```javascript
// File: src/hooks/useKitchenQueue.js
const handleRealtimeUpdate = useCallback((payload) => {
  console.log('🔄 Kitchen queue update received:', payload);

  // Handle INSERT event (pesanan baru)
  if (payload.eventType === 'INSERT') {
    console.log('➕ New kitchen order inserted');
    setKitchenOrders(prev => [payload.new, ...prev]);
    setPendingCount(prev => prev + 1);
  }
  
  // Handle UPDATE event (status berubah)
  else if (payload.eventType === 'UPDATE') {
    console.log('🔄 Kitchen order updated');
    setKitchenOrders(prev => 
      prev.map(order => 
        order.id === payload.new.id ? payload.new : order
      )
    );
  }
  
  // Handle DELETE event (pesanan dihapus)
  else if (payload.eventType === 'DELETE') {
    console.log('➖ Kitchen order deleted');
    setKitchenOrders(prev => 
      prev.filter(order => order.id !== payload.old.id)
    );
    setPendingCount(prev => Math.max(0, prev - 1));
  }
}, []);
```

### **4. UI Trigger Button**

```javascript
// File: src/pages/OrderStatusPage.jsx
const { refresh } = useKitchenQueue(restaurant?.id, null, true);

// Di JSX:
<button
  onClick={refresh}
  disabled={loading}
  className="px-3 py-1 bg-[#FFD700] text-[#0D0D0D] text-xs font-medium rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
>
  {loading ? 'Loading...' : 'Refresh'}
</button>
```

## 🚀 Cara Test Trigger

### **Test 1: Auto-Trigger (Pesan Menu)**
1. Buka aplikasi → Pilih menu → Add to cart
2. Klik "Checkout" → Isi data customer
3. Klik "Pesan Sekarang"
4. **Expected:** Console log muncul:
   ```
   🍳 Creating kitchen queue for pesanan: [id]
   ✅ Kitchen queue created: [id]
   🔄 Kitchen queue auto-created, triggering real-time update...
   ```

### **Test 2: Realtime Update (Buka Halaman Antrian)**
1. Setelah pesan menu → Klik "Antrian" di header
2. **Expected:** Pesanan muncul di halaman antrian
3. **Expected:** Console log muncul:
   ```
   🔄 Kitchen queue update received: { eventType: 'INSERT', new: {...} }
   ➕ New kitchen order inserted
   ```

### **Test 3: Manual Refresh (Jika Realtime Gagal)**
1. Buka halaman "Antrian"
2. Klik tombol "Refresh"
3. **Expected:** Data ter-update
4. **Expected:** Console log muncul:
   ```
   🔄 Manual refresh kitchen queue...
   ✅ Manual refresh completed
   ```

## 🔧 Troubleshooting

### **Jika Realtime Tidak Trigger:**

1. **Check Supabase Realtime:**
   ```sql
   -- Pastikan realtime enabled di Supabase Dashboard
   -- Settings → Database → Replication → Enable realtime
   ```

2. **Check Console Logs:**
   ```javascript
   // Pastikan ada log ini:
   console.log('🔗 Creating kitchen queue subscription:', subscriptionId);
   console.log('📡 Kitchen queue subscription status:', status);
   ```

3. **Manual Refresh:**
   ```javascript
   // Gunakan tombol refresh di UI
   // Atau panggil langsung di console:
   window.location.reload();
   ```

### **Jika Data Tidak Muncul:**

1. **Check Database:**
   ```sql
   SELECT * FROM kitchen_queue ORDER BY created_at DESC;
   SELECT * FROM kitchen_queue_items ORDER BY created_at DESC;
   ```

2. **Check Network:**
   - Buka DevTools → Network tab
   - Lihat request ke Supabase
   - Pastikan tidak ada error 401/403

## 📱 Flow Lengkap

```
1. Customer pesan menu
   ↓
2. createPesananOnline() dipanggil
   ↓
3. createKitchenQueueFromPesanan() auto-trigger
   ↓
4. INSERT ke kitchen_queue table
   ↓
5. Supabase postgres_changes event
   ↓
6. useKitchenQueue hook menerima update
   ↓
7. UI ter-update real-time
   ↓
8. Customer lihat antrian di halaman "Antrian"
```

## ✅ Status Trigger

- ✅ **Auto-trigger saat pesanan** - Aktif
- ✅ **Realtime subscription** - Aktif  
- ✅ **Manual refresh** - Aktif
- ✅ **Debug logging** - Aktif
- ✅ **Error handling** - Aktif

**Semua trigger sudah aktif dan siap digunakan!** 🚀
