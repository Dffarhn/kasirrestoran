# Logic: Placeholder → Fetch (Website Template)

Dokumen ini menjelaskan **alur dari placeholder ke fetch**: placeholder apa yang ada, data apa yang harus di-fetch, dari tabel mana, dan urutan logic-nya. Dipakai baik di **client (TokoWebsitePage)** maupun di **modul build full HTML di belakang layar**.

---

## 1. Input

- **Primary:** `slug` (string, unik di `toko_website_settings.slug`).
- **Alternatif:** `toko_id` (uuid). Jika pakai `toko_id`, harus resolve dulu ke `slug` via `toko_website_settings` agar dapat `template_id` dan `code`.

Semua fetch berikut bisa dijalankan setelah punya `slug` (atau setelah dapat `toko_id` + `template_id` dari satu query).

---

## 2. Placeholder → Sumber data (ringkas)

| Placeholder | Sumber fetch | Tabel / query |
|-------------|--------------|----------------|
| `{{nama_toko}}` | Langsung dari row | `toko.nama_toko` |
| `{{whatsapp}}` | Langsung dari row | `toko.whatsapp_number` |
| `{{link_gmaps}}` | Langsung dari row | `toko.gmaps_link` |
| `{{social_media}}` | Langsung dari row | `toko.social_media` |
| `{{slug}}` | Langsung dari row | `toko_website_settings.slug` |
| `{{logo_url}}` | Langsung dari row | `toko_website_settings.logo_url` |
| `{{template_name}}` | Langsung dari row | `toko_website_templates.name` |
| `{{meta_title}}` | Dibangun di kode | `toko.nama_toko` + `" - Mitra Mibebi POS"` |
| `{{meta_description}}` | Dibangun di kode | Teks statis + `toko.nama_toko` |
| `{{menu_grid}}` | Dibangun dari array | Query **menu** by `toko.id`, lalu render ke HTML |

Placeholder dari **config** (jika ada kolom `config` jsonb di `toko_website_settings`):  
`{{primary_color}}`, `{{alamat_toko}}`, `{{kota}}`, `{{jam_buka}}`, dll. → ambil dari `toko_website_settings.config[key]`.

---

## 3. Urutan fetch (dependency)

### Langkah 1: Ambil settings + toko + template dalam satu kali query

Supabase (atau SQL) sekali jalan:

- **From:** `toko_website_settings`
- **Filter:** `slug = :slug` (atau `toko_id = :toko_id` jika input pakai toko_id).
- **Select:**
  - Kolom sendiri: `id`, `toko_id`, `template_id`, `slug`, `logo_url`, (dan `config` jika ada).
  - Relasi: `toko ( id, nama_toko, whatsapp_number, gmaps_link, social_media )`
  - Relasi: `toko_website_templates ( name, code )`

Hasil: satu objek yang berisi `settings`, `toko`, `template` (termasuk `template.code`).

Dari sini bisa isi:

- `{{nama_toko}}`, `{{whatsapp}}`, `{{link_gmaps}}`, `{{social_media}}` dari `toko`
- `{{slug}}`, `{{logo_url}}` dari `settings`
- `{{template_name}}` dari `template`
- `{{meta_title}}`, `{{meta_description}}` dibangun dari `toko.nama_toko`
- Jika ada `config`: isi placeholder tambahan dari `settings.config`

### Langkah 2: Fetch menu (butuh `toko.id`)

- **Input:** `toko.id` dari hasil Langkah 1.
- **Query:** sama dengan `fetchMenuWithVariasiAndImages(tokoId)`:
  - From: `menu`
  - Select: kolom menu + `kategori(nama)`, `menu_variasi(*)`
  - Filter: `toko_id = toko.id`
  - Order: `nama` (asc)
- **Transform:** setiap item punya `kategori_nama` (dari relasi), `nama`, `harga`, `image_url` / `image_path`, `available`, dll. untuk render card.

### Langkah 3: Bangun `{{menu_grid}}`

- **Input:** array menu dari Langkah 2.
- **Logic:**
  - Jika array kosong → string HTML fallback, mis. `<p class="menu-empty">Menu belum tersedia.</p>`.
  - Jika ada item: untuk tiap item bangun satu card HTML dengan struktur tetap:
    - Wrapper: `<div class="menu-card-img-wrap">` (tinggi bisa diatur di CSS template, mis. 180px).
    - Gambar: `<img src="..." alt="..." class="menu-card-img" loading="lazy" />`.
    - Body: `.menu-card-body` berisi judul, kategori, harga, badge “Tidak tersedia” jika perlu.
  - Escape nilai teks (nama, kategori) untuk hindari XSS.
  - URL gambar: pakai helper yang sama dengan app (mis. `getMenuImageUrl(item)`): prioritas `image_url` → `image_path` → default.
- **Output:** satu string HTML (mis. `<div class="menu-grid">...</div>`).
- **Replace:** di string `template.code`, ganti `{{menu_grid}}` dengan string HTML ini.

### Langkah 4: Replace semua placeholder di `code`

- **Input:** string `template.code`, dan objek map placeholder → nilai (string atau HTML).
- **Process:** untuk tiap key (mis. `nama_toko`, `whatsapp`, `menu_grid`, …), replace semua kemunculan `{{key}}` dengan nilai. Nilai null/undefined → string kosong.
- **Output:** full HTML (tidak ada lagi `{{...}}`).

---

## 4. Diagram alur (ringkas)

```
Input: slug
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Query toko_website_settings (by slug)               │
│    + toko (id, nama_toko, whatsapp_number, gmaps_link,  │
│            social_media)                                 │
│    + toko_website_templates (name, code)                 │
└─────────────────────────────────────────────────────────┘
    │
    │  → settings, toko, template (termasuk code)
    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Query menu (by toko.id)                               │
│    → menu list dengan kategori_nama, image, harga, dll.  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Build nilai turunan                                   │
│    • meta_title     = toko.nama_toko + " - Mitra ..."    │
│    • meta_description = f(toko.nama_toko)                │
│    • menu_grid      = buildMenuGridHtml(menu)            │
│    • (optional) config.* → placeholder dari config       │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 4. applyPlaceholders(code, map)                         │
│    → replace {{nama_toko}}, {{menu_grid}}, dll.          │
│    → full HTML                                           │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Output: full HTML string (siap ditampilkan atau disimpan)
```

---

## 5. Struktur HTML untuk `{{menu_grid}}` (kontrak)

Agar template CSS (`.menu-grid`, `.menu-card-img-wrap`, `.menu-card-img`) konsisten antara admin preview dan generator, gunakan struktur ini:

```html
<div class="menu-grid">
  <article class="menu-card">
    <div class="menu-card-img-wrap">
      <img src="..." alt="..." class="menu-card-img" loading="lazy" />
    </div>
    <div class="menu-card-body">
      <h3 class="menu-card-title">Nama Menu</h3>
      <p class="menu-card-category">Kategori</p>
      <p class="menu-card-price">Rp 25.000</p>
      <!-- optional: .menu-card-badge.menu-card-badge-unavailable -->
    </div>
  </article>
  <!-- ... repeat -->
</div>
```

- **Wrapper gambar:** `menu-card-img-wrap` (tinggi tetap di CSS, mis. 180px).
- **Gambar:** `menu-card-img` + `loading="lazy"`; di CSS pakai `object-fit: cover` dan ukuran 100% terhadap wrapper.

---

## 6. Penggunaan di dua konteks

| Konteks | Fetch | Replace placeholder | Output |
|--------|--------|----------------------|--------|
| **Client (TokoWebsitePage)** | Satu kali: settings+toko+template, lalu menu by toko.id | Di browser: `applyPlaceholders` + `buildMenuGridHtml` | `setHtmlCode(rendered)` → iframe.srcDoc |
| **Build full HTML (backend)** | Sama: by slug dapat settings+toko+template; by toko.id dapat menu | Di server: logic yang sama (shared) | Full HTML → simpan ke DB/storage atau return sebagai response |

Spesifikasi placeholder dan urutan fetch di dokumen ini dipakai untuk **keduanya**, supaya hasil tampilan sama dan template bisa statis (pre-rendered) nanti.
