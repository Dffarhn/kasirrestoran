# Panduan Parameter URL untuk Web Frontend

## Masalah yang Diselesaikan

Sebelumnya, parameter `toko_id` dan `nomor_meja` hanya diambil dari URL saat pertama kali aplikasi dimuat, tetapi tidak dibawa terus menerus saat navigasi antar halaman. Ini menyebabkan parameter hilang saat user berpindah halaman.

## Solusi yang Diimplementasikan

### 1. Utility Functions (`src/utils/urlParams.js`)

Dibuat utility functions untuk menangani parameter URL:

- `getUrlParams()` - Mengambil parameter dari URL saat ini
- `buildUrlWithParams(path, params)` - Membuat URL dengan parameter
- `navigateWithParams(navigate, path, params, options)` - Navigasi dengan parameter
- `getParamFromStorage()` - Mengambil parameter dari localStorage
- `saveParamsToStorage(params)` - Menyimpan parameter ke localStorage

### 2. RestaurantContext Update

- Parameter diambil dari URL atau localStorage sebagai fallback
- Parameter disimpan ke localStorage untuk backup
- Context menyediakan function `getUrlParams()` untuk komponen lain

### 3. Komponen yang Diupdate

Semua komponen navigasi telah diupdate untuk membawa parameter:

- `Header.jsx` - Link ke cart
- `FloatingCartButton.jsx` - Link ke cart
- `CartSummary.jsx` - Link ke checkout dan menu
- `EmptyCart.jsx` - Link ke menu
- `CheckoutPage.jsx` - Navigasi ke konfirmasi
- `OrderConfirmationPage.jsx` - Link kembali ke menu

## Cara Penggunaan

### URL Awal
```
http://localhost:3000/?toko_id=123&table=5
```

### Navigasi Otomatis
Semua navigasi akan otomatis membawa parameter:
- Menu → Cart: `/?toko_id=123&table=5` → `/cart?toko_id=123&table=5`
- Cart → Checkout: `/cart?toko_id=123&table=5` → `/checkout?toko_id=123&table=5`
- Checkout → Confirmation: `/checkout?toko_id=123&table=5` → `/confirmation?toko_id=123&table=5`

### Fallback ke localStorage
Jika parameter tidak ada di URL, sistem akan mengambil dari localStorage yang tersimpan sebelumnya.

## Testing

Untuk test implementasi:

1. Buka aplikasi dengan URL: `http://localhost:3000/?toko_id=123&table=5`
2. Navigasi ke halaman cart, checkout, dan confirmation
3. Periksa bahwa parameter `toko_id` dan `table` tetap ada di URL
4. Refresh halaman - parameter harus tetap ada
5. Buka tab baru tanpa parameter - sistem akan menggunakan parameter dari localStorage

## Parameter yang Didukung

- `toko_id` atau `restaurant_id` - ID toko/restoran
- `table` atau `nomor_meja` - Nomor meja (default: "1")

## Contoh URL Lengkap

```
http://localhost:3000/?toko_id=abc123&table=3
http://localhost:3000/cart?toko_id=abc123&table=3
http://localhost:3000/checkout?toko_id=abc123&table=3
http://localhost:3000/confirmation?toko_id=abc123&table=3
```
