# Portal Pendaftaran Online — Yayasan Musik Jakarta (YMJ)

Website formulir pendaftaran online untuk 3 jenjang sekolah di bawah Yayasan Musik Jakarta, dengan dashboard rekap admin dan integrasi Google Spreadsheet melalui Google Apps Script.

## 📋 Daftar Halaman

| File | Fungsi |
|---|---|
| `index.html` | **Halaman utama** — landing + link ke 3 formulir & admin |
| `form-smj.html` | **Formulir SMJ** — Sekolah Musik Jakarta (semua usia) |
| `form-smkm.html` | **Formulir SMKM-YMJ** — PPDB SMK Musik 2025/2026 |
| `form-stikmi.html` | **Formulir STIKMI** — Aplikasi Mahasiswa Baru |
| `admin.html` | **Dashboard Admin** — rekap semua pendaftar (proteksi password) |
| `css/style.css` | Stylesheet |
| `js/app.js` | Config + helper (URL Apps Script, fungsi submit/fetch) |
| `apps-script/Code.gs` | Kode Google Apps Script untuk spreadsheet |

## 🚀 Cara Deploy ke GitHub Pages

### Langkah 1 — Buat Repository di GitHub

1. Login ke https://github.com → klik **New repository**.
2. Nama repo: misal `ymj-formulir`. Pilih **Public**.
3. Klik **Create repository** (jangan centang README dulu — biar kosong).

### Langkah 2 — Upload File ke Repository

**Opsi A — Upload lewat browser (paling mudah):**
1. Di halaman repo kosong, klik **uploading an existing file**.
2. Drag semua file dari folder `formulir-web/` (file HTML, folder `css/`, `js/`, `apps-script/`).
3. Tulis commit message: `Initial: portal formulir YMJ`.
4. Klik **Commit changes**.

**Opsi B — Lewat Git CLI** (jika Anda pakai terminal):
```bash
# clone repo kosong itu dulu
git clone https://github.com/USERNAME/ymj-formulir.git
cd ymj-formulir

# copy semua isi formulir-web/ ke repo
cp -r /path/ke/formulir-web/* .

git add .
git commit -m "Initial: portal formulir YMJ"
git push origin main
```

### Langkah 3 — Aktifkan GitHub Pages

1. Di repo, klik tab **Settings** → menu **Pages** (sidebar kiri).
2. **Source**: pilih **Deploy from a branch**.
3. **Branch**: pilih `main` → folder `/ (root)` → klik **Save**.
4. Tunggu ±1–2 menit. Website Anda akan online di:
   ```
   https://USERNAME.github.io/ymj-formulir/
   ```

## 🔌 Setup Integrasi Google Spreadsheet (Apps Script)

Bagian ini membuat data dari form otomatis masuk ke Google Spreadsheet.

### Langkah 1 — Buat Project Apps Script

1. Buka https://script.google.com → klik **New Project**.
2. Hapus semua isi file `Code.gs` default.
3. Buka file `apps-script/Code.gs` dari folder project ini, **copy seluruh isinya**, lalu **paste** ke editor Apps Script.
4. (Opsional) Ganti `SPREADSHEET_ID = ""` dengan ID spreadsheet yang sudah Anda buat:
   - Buka Google Sheets → buat spreadsheet baru kosong.
   - URL: `https://docs.google.com/spreadsheets/d/`**`<INILAH_ID>`**`/edit`
   - Tempel ID itu di antara tanda kutip.
   - **Atau biarkan `""`** — script akan otomatis membuat spreadsheet baru saat data pertama masuk.

### Langkah 2 — Deploy sebagai Web App

1. Klik **Deploy** (pojok kanan atas) → **New deployment**.
2. Klik ikon roda gigi ⚙️ → pilih **Web app**.
3. Isi:
   - **Description**: `Formulir Pendaftaran YMJ`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone`
4. Klik **Deploy**. Saat muncul popup otorisasi, klik **Allow access**.
5. Akan muncul **Web app URL** dengan format:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   **Copy URL ini.**

### Langkah 3 — Hubungkan URL ke Website

1. Buka file `js/app.js` di repo GitHub Anda (atau folder lokal).
2. Cari baris ini (di bagian atas):
   ```js
   const APPS_SCRIPT_URL = "PASTE_URL_APPS_SCRIPT_WEB_APP_DISINI";
   ```
3. Ganti dengan URL yang baru Anda copy:
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Commit & push perubahan ke GitHub.

### Langkah 4 — Verifikasi

1. Buka website di `https://USERNAME.github.io/ymj-formulir/`.
2. Isi salah satu formulir (SMJ / SMKM / STIKMI) → klik **Kirim Pendaftaran**.
3. Cek spreadsheet — akan otomatis muncul:
   - Sheet **SMJ** / **SMKM** / **STIKMI** (data terstruktur per form).
   - Sheet **All** (semua data, field `data_json` berisi raw JSON).

> **Catatan:** Jika Anda mengubah `SPREADSHEET_ID` atau kode Apps Script setelah deploy pertama, **deploy ulang sebagai "New deployment"** (bukan edit deployment lama) supaya cache lama tidak dipakai.

## 🔐 Mengubah Password Admin

Password default: **`admin123`** — **WAJIB diganti** sebelum produksi.

1. Buka `js/app.js`:
   ```js
   const ADMIN_DEFAULT_PASSWORD = "admin123";
   ```
   Ganti dengan password kuat Anda.

2. (Opsional, untuk proteksi ekstra di sisi server) Buka `apps-script/Code.gs`:
   ```js
   var ADMIN_PASSWORD = "admin123";
   ```
   Ganti dengan password yang sama. Lalu redeploy Apps Script.

3. Setelah login berhasil, password disimpan di `sessionStorage` (hilang saat tab ditutup).

## 📊 Cara Pakai Dashboard Admin

1. Buka `https://USERNAME.github.io/ymj-formulir/admin.html`.
2. Masukkan password → klik **Masuk**.
3. Anda akan melihat:
   - **Statistik**: total pendaftar per jenjang.
   - **Tabel rekap**: nama, tanggal, kontak, jurusan.
   - **Filter** per jenis form + pencarian.
   - **Refresh** untuk ambil data terbaru.
   - **Export CSV** untuk unduh data.
   - **Detail** per pendaftar (modal pop-up menampilkan semua field).

## 🧪 Mode Demo (tanpa Apps Script)

Jika `APPS_SCRIPT_URL` belum diisi (masih `PASTE_URL_...`), website tetap jalan:
- Data submit disimpan di `localStorage` browser (satu perangkat).
- Dashboard admin membaca data dari `localStorage` tersebut.
- Cocok untuk testing tampilan sebelum sambungkan ke spreadsheet.
- Setelah URL Apps Script terisi, semua submit langsung ke spreadsheet.

## 🛠️ Kustomisasi Lanjutan

### Mengubah / menambah field formulir
1. Edit file HTML (mis. `form-smj.html`).
2. Tambahkan `<input>` / `<select>` / `<textarea>` dengan `name` baru.
3. Buka `apps-script/Code.gs`, tambahkan nama field itu ke array `SHEET_COLUMNS[formType]` (urutan menentukan kolom di spreadsheet).
4. Untuk admin: tambahkan mapping label di `prettyLabel()` di `admin.html`.
5. Redeploy Apps Script.

### Mengganti warna / brand
- Edit variabel CSS di bagian atas `css/style.css`:
  ```css
  :root {
    --primary: #1e3a8a;    /* warna utama */
    --accent: #d4af37;     /* warna aksen (emas) */
    ...
  }
  ```

## ❓ Troubleshooting

| Masalah | Solusi |
|---|---|
| Data submit tidak muncul di spreadsheet | Pastikan `APPS_SCRIPT_URL` di `js/app.js` sudah benar & Apps Script sudah di-deploy ulang jika `Code.gs` berubah. Cek console browser (F12). |
| Halaman blank / 404 di GitHub Pages | Pastikan semua file sudah ter-commit & pushed ke branch `main`, dan GitHub Pages sudah di-set ke `main / root`. |
| Form submit berhasil tapi `mode: "demo"` | Artinya `APPS_SCRIPT_URL` belum diganti. Lihat Langkah 3 di atas. |
| Login admin gagal | Password yang dimasukkan tidak cocok dengan `ADMIN_DEFAULT_PASSWORD` di `js/app.js`. |
| Spreadsheet tidak dibuat otomatis | Buka Apps Script editor → jalankan fungsi `testInsert` manual satu kali. Cek log untuk Spreadsheet ID. |
| CORS / fetch gagal | Pastikan "Who has access" = **Anyone** saat deploy Apps Script. POST memakai `mode: "no-cors"` (normal). GET untuk admin memakai mode biasa. |

## 📞 Struktur Folder

```
formulir-web/
├── index.html              # Halaman utama
├── form-smj.html           # Formulir SMJ
├── form-smkm.html          # Formulir SMKM
├── form-stikmi.html        # Formulir STIKMI
├── admin.html              # Dashboard admin
├── css/
│   └── style.css
├── js/
│   └── app.js
├── apps-script/
│   └── Code.gs             # Google Apps Script
└── README.md
```

## 📄 Lisensi

Bebas digunakan untuk keperluan internal Yayasan Musik Jakarta & sekolah-sekolah di bawahnya.
