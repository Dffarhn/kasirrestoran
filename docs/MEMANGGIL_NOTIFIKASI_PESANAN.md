# Memanggil notifikasi pesanan baru ke kasir

Dokumen ini menjelaskan **cara kerja** dan **cara memanggil** alur notifikasi FCM ke perangkat kasir melalui Edge Function Supabase `send-order-notification`.

Untuk ringkasan implementasi awal di web, lihat juga `NOTIFICATION_IMPLEMENTATION.md` di root repo.

---

## Ringkasan alur

1. **Default (web customer):** setelah `pesanan_online` + detail + stok berhasil, `createPesananOnline()` di `src/services/database.js` memanggil `sendOrderNotification()` → Edge Function mengirim FCM ke semua token aktif untuk `toko_id`.
2. **Edge Function:** `supabase/functions/send-order-notification/index.ts` — mengambil baris dari `kasir_fcm_tokens` (`is_active = true`), **mendeduplikasi `fcm_token`** agar satu token tidak dikirimi dua kali, lalu memanggil FCM HTTP v1.

---

## 1. Otomatis dari aplikasi web (disarankan)

Tidak perlu memanggil manual jika flow-nya lewat checkout:

| Langkah | File / fungsi |
|--------|----------------|
| Submit checkout | `src/pages/CheckoutPage.jsx` → `createPesananOnline(orderData)` |
| Setelah pesanan tersimpan | `createPesananOnline` memanggil `sendOrderNotification({ ... })` |

Payload yang dikirim (field wajib untuk Edge Function):

| Field | Sumber |
|-------|--------|
| `order_id` | `pesanan.id` |
| `toko_id` | `pesanan.toko_id` |
| `customer_name` | `pesanan.customer_name` |
| `total_amount` | `pesanan.total_amount` |
| `created_at` | `pesanan.created_at` (opsional di function, fallback ke waktu sekarang) |

Jika notifikasi gagal, pesanan **tetap tersimpan**; error hanya di-log.

---

## 2. Memanggil dari kode (JavaScript / Supabase client)

Import fungsi yang sudah membungkus `invoke`:

```javascript
import { sendOrderNotification } from '../services/database'; // sesuaikan path

await sendOrderNotification({
  order_id: 'uuid-pesanan',
  toko_id: 'uuid-toko',
  customer_name: 'Nama Customer',
  total_amount: 75000,
  created_at: new Date().toISOString(), // opsional
});
```

**Catatan:** `sendOrderNotification` tidak melempar error ke caller (mengembalikan `null` jika gagal) agar flow utama tidak putus.

Client Supabase harus sudah terkonfigurasi (URL + anon key / session) seperti di aplikasi ini.

---

## 3. Memanggil Edge Function secara langsung

**Nama function:** `send-order-notification`

### Menggunakan Supabase client

```javascript
const { data, error } = await supabase.functions.invoke('send-order-notification', {
  body: {
    order_id: orderId,
    toko_id: tokoId,
    customer_name: customerName,
    total_amount: totalAmount,
    created_at: createdAtIsoString, // opsional
  },
});
```

Header `Authorization` dan `apikey` ditambahkan otomatis oleh client.

### Menggunakan HTTP (misalnya Postman / curl)

- **URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/send-order-notification`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT atau anon key>` — untuk anon key, gunakan key publik proyek; untuk pemanggilan server-to-server, ikuti kebijakan keamanan tim Anda.
  - `apikey: <SUPABASE_ANON_KEY>` (biasanya wajib untuk Functions)

**Contoh body:**

```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "toko_id": "660e8400-e29b-41d4-a716-446655440001",
  "customer_name": "Budi",
  "total_amount": 120000,
  "created_at": "2026-04-07T10:00:00.000Z"
}
```

**Validasi di Edge Function:** `order_id`, `toko_id`, `customer_name`, dan `total_amount` **wajib**. Tanpa itu response **400** dengan pesan error JSON.

**Response sukses (contoh):**

```json
{
  "success": true,
  "order_id": "...",
  "toko_id": "...",
  "total_kasir": 1,
  "success_count": 1,
  "failure_count": 0,
  "results": [ ... ]
}
```

Jika tidak ada token aktif untuk toko: **404** dengan `error` menjelaskan bahwa tidak ada kasir.

---

## 4. Prasyarat agar notifikasi sampai ke kasir

1. **Tabel `kasir_fcm_tokens`:** minimal satu baris dengan `toko_id` yang sama, `is_active = true`, dan `fcm_token` valid.
2. **Variabel lingkungan Edge Function** (Firebase / Google): `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, dll., sesuai setup di function — sama seperti deployment FCM v1 Anda.
3. **Deploy:** function harus ter-deploy ke proyek Supabase yang sama dengan aplikasi web.

---

## 5. Deploy Edge Function

Dari folder root repo (dengan Supabase CLI terpasang):

```bash
supabase functions deploy send-order-notification
```

Pastikan file sumber ada di `supabase/functions/send-order-notification/index.ts`.

---

## 6. Migrasi database (opsional)

File: `supabase/migrations/20260407120000_kasir_fcm_tokens_unique_toko_token.sql`

- Membersihkan duplikat `(toko_id, fcm_token)`.
- Menambah **UNIQUE** `(toko_id, fcm_token)` agar tidak ada dua baris token sama per toko.

Jika tidak dijalankan, **dedupe di Edge Function** tetap mencegah dua kali kirim ke satu token; migrasi disarankan untuk integritas data dan upsert token dari aplikasi kasir.

---

## 7. Troubleshooting singkat

| Gejala | Hal yang dicek |
|--------|----------------|
| Tidak ada notifikasi | Log function Supabase; jumlah token aktif untuk `toko_id`; kredensial FCM; token tidak `UNREGISTERED` |
| Dua notifikasi ke satu HP | Duplikat baris token yang sama (dedupe di function sudah membantu); setelah migrasi + upsert di app kasir, idealnya hilang |
| 400 dari function | Body kurang field wajib |
| 404 dari function | Tidak ada `kasir_fcm_tokens` aktif untuk toko |

---

## Referensi file di repo

| Bagian | Lokasi |
|--------|--------|
| Invoke dari web | `src/services/database.js` — `sendOrderNotification`, `createPesananOnline` |
| Checkout | `src/pages/CheckoutPage.jsx` |
| Edge Function | `supabase/functions/send-order-notification/index.ts` |
| Migrasi unik token | `supabase/migrations/20260407120000_kasir_fcm_tokens_unique_toko_token.sql` |
