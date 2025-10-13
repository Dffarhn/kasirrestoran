# 🍽️ Table Number Included - Kitchen Queue

## ✅ Perbaikan yang Dilakukan

### **Masalah Sebelumnya:**
- ❌ **Nomor meja tidak diikutsertakan** dalam kitchen queue
- ❌ **Staff dapur tidak tahu** pesanan untuk meja berapa
- ❌ **Customer tidak bisa track** pesanan berdasarkan meja

### **Perbaikan yang Dilakukan:**
- ✅ **Include table_number** dalam kitchen queue
- ✅ **Staff dapur tahu** pesanan untuk meja berapa
- ✅ **Customer bisa track** pesanan berdasarkan meja
- ✅ **Better order management** untuk staff

## 🔧 Implementasi

### **1. Update createKitchenQueueFromPesanan:**
```javascript
// SEBELUM (SALAH):
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
  });

// SESUDAH (BENAR):
const { data: kitchenQueue } = await supabase
  .from('kitchen_queue')
  .insert({
    toko_id: orderData.tokoId,
    source_type: 'online',
    source_id: pesananId,
    order_number: 'ORD-' + pesananId,
    table_number: orderData.tableNumber, // 🆕 Include table number
    customer_name: orderData.customerInfo.name,
    customer_phone: orderData.customerInfo.phone,
    total_amount: orderData.total,
    subtotal: orderData.subtotal
  });
```

### **2. Schema Support:**
```sql
-- Field table_number sudah ada di schema
CREATE TABLE public.kitchen_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  order_number text NOT NULL,
  table_number text, -- ✅ Field sudah tersedia
  customer_name text,
  customer_phone text,
  -- ... other fields
);
```

## 🚀 Flow Lengkap

### **Saat Pesanan:**
1. **Customer pesan menu** → Pilih meja (tableNumber)
2. **Submit pesanan** → `createPesananOnline(orderData)`
3. **Auto-create kitchen queue** → Include `table_number: orderData.tableNumber`
4. **Staff dapur lihat** → Tahu pesanan untuk meja berapa
5. **Customer track** → Bisa lihat pesanan berdasarkan meja

### **Data yang Tersimpan:**
```javascript
{
  toko_id: "restaurant-id",
  source_type: "online",
  source_id: "pesanan-id",
  order_number: "ORD-123",
  table_number: "5", // 🆕 Nomor meja
  customer_name: "John Doe",
  customer_phone: "08123456789",
  total_amount: 50000,
  subtotal: 45000
}
```

## 📱 UI Impact

### **OrderStatusPage:**
- ✅ **Customer bisa lihat** pesanan berdasarkan meja mereka
- ✅ **Filter berdasarkan meja** → `order.table_number === restaurant?.tableNumber`
- ✅ **Queue position** → Posisi dalam antrian untuk meja mereka
- ✅ **Better tracking** → Customer tahu pesanan mereka

### **Staff Dapur (Future):**
- ✅ **Lihat nomor meja** → Tahu pesanan untuk meja berapa
- ✅ **Organize by table** → Kelompokkan pesanan berdasarkan meja
- ✅ **Better service** → Bisa deliver ke meja yang tepat

## 🎯 Hasil Akhir

**Sekarang kitchen queue:**
- ✅ **Include nomor meja** - `table_number` tersimpan
- ✅ **Staff tahu meja** - Pesanan untuk meja berapa
- ✅ **Customer bisa track** - Pesanan berdasarkan meja mereka
- ✅ **Better order management** - Organize pesanan berdasarkan meja

**Nomor meja sekarang tersimpan dalam kitchen queue!** 🍽️✨

## 🔍 Debug Logs

```javascript
// Console logs yang akan muncul:
🍳 Creating kitchen queue for pesanan: [pesanan-id]
✅ Kitchen queue created: [kitchen-queue-id]
// Data yang tersimpan:
{
  table_number: "5", // ✅ Nomor meja tersimpan
  customer_name: "John Doe",
  order_number: "ORD-123"
}
```

**Table number sekarang diikutsertakan dalam kitchen queue!** 🍽️✨
