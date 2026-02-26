## Placeholder Template Website Toko Mibebi

Dokumen ini mendefinisikan **placeholder standar** yang boleh digunakan di `toko_website_templates.code` beserta sumber datanya di database, plus bentuk **mock data** yang digunakan admin saat membuat / preview template.

---

### 1. Placeholder yang bisa dipakai sekarang (tanpa ubah schema)

Placeholder berikut sudah bisa diisi langsung dari tabel yang ada (`toko`, `toko_website_settings`, `toko_website_templates`).

> **Format placeholder:** `{{nama_placeholder}}` (huruf kecil + underscore, tanpa minus `-`).

#### 1.1. Data toko

| Placeholder       | Sumber data                                | Keterangan                              |
| -----------------|--------------------------------------------|-----------------------------------------|
| `{{nama_toko}}`  | `toko.nama_toko`                           | Nama publik toko                        |
| `{{whatsapp}}`   | `toko.whatsapp_number`                     | Nomor WhatsApp                          |
| `{{link_gmaps}}` | `toko.gmaps_link`                          | Link Google Maps                        |
| `{{social_media}}` | `toko.social_media` (raw)                | String/JSON sosial media (opsional)     |

#### 1.2. Data website / setting

| Placeholder       | Sumber data                                   | Keterangan                              |
| -----------------|-----------------------------------------------|-----------------------------------------|
| `{{slug}}`       | `toko_website_settings.slug`                  | Slug URL toko (`/{slug}`)               |
| `{{logo_url}}`   | `toko_website_settings.logo_url`              | Logo khusus website toko                |
| `{{template_name}}` | `toko_website_templates.name`              | Nama template (Minimalis, Modern, dll.) |

#### 1.3. Placeholder turunan (dibangun di kode)

| Placeholder       | Dibangun dari                                 | Contoh                                   |
| -----------------|-----------------------------------------------|------------------------------------------|
| `{{meta_title}}` | `toko.nama_toko` + string tambahan           | `\"Kedai Kopi Senja - Mitra Mibebi POS\"` |
| `{{meta_description}}` | teks statis + `toko.nama_toko`        | Deskripsi singkat SEO                    |

Implementasi FE akan mengganti placeholder ini dengan `String.replace(/{{nama_toko}}/g, value)` sebelum dikirim ke `iframe.srcDoc`.

---

### 2. Placeholder menu

Untuk v1, kita pakai satu **slot blok HTML**:

| Placeholder       | Sumber data                          | Keterangan                                    |
| -----------------|--------------------------------------|-----------------------------------------------|
| `{{menu_grid}}`  | hasil render dari array menu toko    | HTML string card menu                        |

Contoh di template:

```html
<section class="menu-section">
  <h2>Menu Kami</h2>
  {{menu_grid}}
</section>
```

Contoh struktur data menu (setelah fetch dari Supabase):

```json
[
  {
    "id": "uuid-1",
    "nama": "Espresso Single",
    "harga": 18000,
    "kategori_nama": "Kopi",
    "image_url": "https://...",
    "discount_percentage": 0,
    "available": true
  },
  {
    "id": "uuid-2",
    "nama": "Cappuccino",
    "harga": 25000,
    "kategori_nama": "Kopi",
    "image_url": "https://...",
    "discount_percentage": 10,
    "available": true
  }
]
```

FE akan membangun `menu_grid` sebagai HTML:

- Loop array menu
- Bangun `<div class="menu-card">...</div>` per item
- Join semua jadi satu string dan `replace` ke `{{menu_grid}}`

> **Catatan:** nanti bisa dikembangkan ke mini-loop `{{#menu}} ... {{/menu}}`, tapi v1 cukup `{{menu_grid}}`.

---

### 3. Placeholder yang disarankan (butuh kolom tambahan / config)

Placeholder di bawah ini **belum ada kolom spesifik** di schema sekarang, tapi sangat berguna untuk tampilan website. Disarankan disimpan di `toko_website_settings` (kolom biasa) atau satu kolom `config jsonb`.

#### 3.1. Branding & visual

| Placeholder         | Saran lokasi data             | Contoh nilai       |
| -------------------|------------------------------|--------------------|
| `{{primary_color}}`   | `toko_website_settings.config` | `\"#D83028\"`      |
| `{{secondary_color}}` | `toko_website_settings.config` | `\"#F8C028\"`      |
| `{{hero_image_url}}`  | `toko_website_settings.config` | URL gambar hero    |

#### 3.2. Konten deskriptif

| Placeholder           | Saran lokasi data             | Keterangan                      |
| ---------------------|------------------------------|---------------------------------|
| `{{alamat_toko}}`    | `toko_website_settings.config` | Alamat tekstual                 |
| `{{kota}}`           | `toko_website_settings.config` | Kota                            |
| `{{jam_buka}}`       | `toko_website_settings.config` | \"10:00 - 22:00\"               |
| `{{hari_operasional}}` | `toko_website_settings.config` | \"Senin - Minggu\"             |

#### 3.3. Sosial & SEO

| Placeholder           | Saran lokasi data             |
| ---------------------|------------------------------|
| `{{instagram}}`      | `toko_website_settings.config` |
| `{{tiktok}}`         | `toko_website_settings.config` |
| `{{facebook}}`       | `toko_website_settings.config` |
| `{{website_url}}`    | `toko_website_settings.config` |
| `{{og_image}}`       | `toko_website_settings.config` |

Dengan pola `config jsonb`, struktur contoh:

```json
{
  "primary_color": "#D83028",
  "secondary_color": "#F8C028",
  "hero_image_url": "https://...",
  "alamat_toko": "Jl. Braga No. 21, Bandung",
  "kota": "Bandung",
  "jam_buka": "10:00 - 22:00",
  "hari_operasional": "Senin - Minggu",
  "instagram": "@kedaikopisenja",
  "meta_description": "Coffee shop di Bandung dengan suasana senja yang hangat."
}
```

---

### 4. Bentuk mock data untuk admin (preview builder)

Agar preview admin **sesuai dengan runtime FE**, mock data sebaiknya mengikuti shape berikut:

```json
{
  "toko": {
    "id": "uuid-toko",
    "nama_toko": "Kedai Kopi Senja",
    "whatsapp_number": "+62 812-3456-7890",
    "gmaps_link": "https://maps.google.com/...",
    "social_media": "{ \"instagram\": \"@kedaikopisenja\" }"
  },
  "website_settings": {
    "slug": "kedai-kopi-senja",
    "logo_url": "https://...",
    "template_id": "uuid-template",
    "config": {
      "primary_color": "#D83028",
      "secondary_color": "#F8C028",
      "hero_image_url": "https://...",
      "alamat_toko": "Jl. Braga No. 21, Bandung",
      "kota": "Bandung",
      "jam_buka": "10:00 - 22:00",
      "hari_operasional": "Senin - Minggu",
      "instagram": "@kedaikopisenja",
      "meta_description": "Coffee shop di Bandung dengan suasana senja yang hangat."
    }
  },
  "template": {
    "id": "uuid-template",
    "name": "Minimalis",
    "code": "<!doctype html>...{{nama_toko}}...{{menu_grid}}..."
  },
  "menu": [
    {
      "id": "uuid-1",
      "nama": "Espresso Single",
      "harga": 18000,
      "kategori_nama": "Kopi",
      "image_url": "https://...",
      "discount_percentage": 0,
      "available": true
    },
    {
      "id": "uuid-2",
      "nama": "Cappuccino",
      "harga": 25000,
      "kategori_nama": "Kopi",
      "image_url": "https://...",
      "discount_percentage": 10,
      "available": true
    }
  ]
}
```

Admin builder cukup:

1. Memuat `template.code` (HTML + placeholder).
2. Apply replace placeholder menggunakan mock JSON di atas.
3. Menampilkan hasilnya di iframe (sama seperti `TokoWebsitePage` di FE).

Dengan standar ini, template HTML yang dibuat admin akan selalu kompatibel dengan data runtime di aplikasi pemesanan online.

