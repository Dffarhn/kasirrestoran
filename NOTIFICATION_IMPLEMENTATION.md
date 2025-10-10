# Implementasi Notifikasi Real-time untuk Pesanan Online

## ✅ Yang Sudah Diimplementasi

### 1. Function `sendOrderNotification` di `src/services/database.js`
- Menggunakan `supabase.functions.invoke()` untuk memanggil Edge Function
- Menggunakan Supabase client yang sudah dikonfigurasi
- Error handling yang robust - tidak mengganggu proses order
- Logging untuk debugging

### 2. Update Function `createPesananOnline`
- Menambahkan panggilan notifikasi setelah pesanan berhasil dibuat
- Data yang dikirim sesuai format yang diharapkan Edge Function

## 🔧 Cara Kerja

1. **Customer submit pesanan** → `CheckoutPage.jsx` → `handleSubmit()`
2. **Pesanan disimpan** → `createPesananOnline()` → Database
3. **Notifikasi dikirim** → `sendOrderNotification()` → Edge Function
4. **Kasir menerima notifikasi** → FCM → Device kasir

## 📊 Data yang Dikirim ke Edge Function

```json
{
  "order_id": "uuid-pesanan",
  "toko_id": "uuid-toko", 
  "customer_name": "Nama Customer",
  "total_amount": 50000,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🧪 Testing

### Test 1: Order Creation
1. Buka aplikasi web
2. Tambahkan item ke cart
3. Isi form checkout
4. Submit pesanan
5. ✅ Pesanan tersimpan di database
6. ✅ User diarahkan ke halaman konfirmasi

### Test 2: Notification
1. Buka Developer Console (F12)
2. Submit pesanan
3. ✅ Lihat log: "Sending notification with data: {...}"
4. ✅ Lihat log: "✅ Notification sent successfully: {...}"

### Test 3: Error Handling
1. Matikan internet atau block Edge Function
2. Submit pesanan
3. ✅ Pesanan tetap tersimpan
4. ✅ Lihat log: "❌ Error sending notification: ..."
5. ✅ User tetap diarahkan ke konfirmasi

## 🔍 Monitoring

### Console Logs
- `Sending notification with data:` - Data yang dikirim
- `✅ Notification sent successfully:` - Notifikasi berhasil
- `❌ Error sending notification:` - Notifikasi gagal
- `Notification failed but order was created successfully:` - Warning jika notifikasi gagal

### Database
- Tabel `pesanan_online` - Pesanan tersimpan
- Tabel `pesanan_online_detail` - Detail pesanan tersimpan
- Tabel `kasir_fcm_tokens` - Token kasir untuk notifikasi

## 🚀 Deployment

Implementasi sudah siap untuk production:
- ✅ Error handling robust
- ✅ Order tetap tersimpan meskipun notifikasi gagal
- ✅ Logging untuk monitoring
- ✅ Async/await untuk performa optimal

## 📱 Kasir Side

Kasir akan menerima notifikasi dengan:
- **Title**: "Pesanan Baru"
- **Body**: "Customer: [nama] - Total: Rp [amount]"
- **Data**: order_id, toko_id, customer_name, total_amount, created_at

## 🔧 Troubleshooting

### Notifikasi tidak terkirim
1. Cek console log untuk error
2. Pastikan Edge Function aktif
3. Pastikan API keys benar
4. Cek network connection

### Order tidak tersimpan
1. Cek database connection
2. Cek Supabase credentials
3. Cek table permissions

### Performance
- Notifikasi dikirim secara async
- Tidak memblokir UI
- Error tidak mengganggu flow utama
