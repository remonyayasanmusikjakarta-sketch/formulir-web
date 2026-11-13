/**
 * ============================================================
 *  GOOGLE APPS SCRIPT — Formulir Pendaftaran YMJ
 * ============================================================
 *
 *  CARA SETUP:
 *  1. Buka https://script.google.com  →  New Project.
 *  2. Hapus isi Code.gs default, lalu PASTE seluruh kode ini.
 *  3. Ganti SPREADSHEET_ID di bawah dengan ID spreadsheet Anda
 *     (ambil dari URL spreadsheet:
 *      https://docs.google.com/spreadsheets/d/<INILAH_ID>/edit).
 *     Atau biarkan kosong "" — script akan otomatis membuat
 *     spreadsheet baru saat data pertama kali masuk.
 *  4. Klik Deploy → New deployment → type "Web app".
 *       - Description: "Formulir Pendaftaran YMJ"
 *       - Execute as: Me (email Anda)
 *       - Who has access: Anyone
 *     Klik Deploy, izinkan akses, lalu COPY web app URL
 *     (format: https://script.google.com/macros/s/AKfyc.../exec).
 *  5. Tempel URL itu ke variabel APPS_SCRIPT_URL di file
 *     formulir-web/js/app.js (GANTI "PASTE_URL_APPS_SCRIPT_WEB_APP_DISINI").
 *  6. Selesai. Setiap kali form disubmit, data otomatis muncul
 *     di spreadsheet (sheet SMJ / SMKM / STIKMI) + sheet "All".
 *
 *  SETUP ULANG: jika SPREADSHEET_ID diganti, deploy ulang sebagai
 *  "New deployment" (bukan "Manage deployments" → edit), supaya
 *  cache lama tidak dipakai.
 * ============================================================
 */

// === GANTI DENGAN ID SPREADSHEET ANDA, atau biarkan "" ===
var SPREADSHEET_ID = "";

// Password opsional untuk endpoint ?action=list (admin).
// Kosongkan "" untuk tanpa proteksi (admin page tetap ada password sendiri).
var ADMIN_PASSWORD = "admin123";

// Struktur kolom tiap sheet (urutan)
var SHEET_COLUMNS = {
  SMJ: [
    "timestamp", "nama_lengkap", "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "usia",
    "alamat", "kode_pos", "telepon_hp", "email",
    "nama_sekolah", "alamat_sekolah", "kelas", "ranking", "total_siswa",
    "pernah_belajar_di", "alat_musik", "dari_tahun", "sampai_tahun",
    "kegiatan_lain_1", "kegiatan_lain_1_hari", "kegiatan_lain_1_pukul",
    "kegiatan_lain_2", "kegiatan_lain_2_hari", "kegiatan_lain_2_pukul",
    "kegiatan_lain_3", "kegiatan_lain_3_hari", "kegiatan_lain_3_pukul",
    "pilihan_hari_jam", "jam_berangkat_sekolah", "jam_pulang_sekolah",
    "senin_pukul", "selasa_pukul", "rabu_pukul", "kamis_pukul", "jumat_pukul", "sabtu_pukul",
    "nama_ayah", "nama_ibu", "pendidikan_ayah", "pekerjaan_ayah",
    "kantor_ayah", "telfax_ayah", "email_ayah", "hp_ayah",
    "pendidikan_ibu", "pekerjaan_ibu", "kantor_ibu", "telfax_ibu", "email_ibu", "hp_ibu",
    "jurusan", "pernyataan"
  ],
  SMKM: [
    "timestamp", "no_audisi", "mfa", "tanggal_pendaftaran",
    "instrument_mayor_1", "instrument_mayor_2",
    "nama_lengkap", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "agama",
    "alamat", "rt", "rw", "kode_pos", "kecamatan", "kelurahan",
    "anak_ke", "bersaudara", "tlp_bapak", "tlp_ibu",
    "sekolah_asal", "status", "kelas_pindahan", "foto",
    "dokumen", "dokumen_lainnya", "asrama", "keterangan",
    "perjanjian_pembayaran", "nama_ortu_wali", "pernyataan"
  ],
  STIKMI: [
    "timestamp", "no_audisi", "instrumen_mayor", "program_studi",
    "konsentrasi", "peminatan_program",
    "nama_lengkap", "tempat_lahir", "tanggal_lahir", "agama",
    "alamat", "kabupaten_kota", "provinsi", "kode_pos",
    "telp_rumah", "hp", "email",
    "nama_ortu_wali", "pekerjaan_ortu_wali", "alamat_ortu_wali",
    "ortu_kabupaten_kota", "ortu_provinsi", "ortu_kode_pos",
    "ortu_telp_rumah", "ortu_hp", "ortu_email", "penghasilan_ortu",
    "tahun_lulus_sma", "jurusan_sma", "nama_sma", "alamat_sma",
    "sma_kabupaten_kota", "sma_provinsi", "sma_kode_pos",
    "perguruan_tinggi", "jurusan_pt", "tahun_masuk_pt", "tahun_lulus_pt",
    "musik_instrumen_mayor", "lama_belajar", "tingkat_grade",
    "nama_sekolah_musik", "nama_guru",
    "repertoar_a", "repertoar_b", "repertoar_c",
    "kompetisi_a", "kompetisi_b", "kompetisi_c",
    "prestasi_a", "prestasi_b", "prestasi_c",
    "instrumen_lain", "lama_belajar_lain",
    "audisi_a", "audisi_b", "audisi_c",
    "motivasi", "tempat", "tanggal", "pernyataan"
  ]
};

/**
 * Handler POST — menerima payload JSON dari form HTML.
 * Body: FormData dengan field "payload" berisi JSON
 *   { formType: "SMJ"|"SMKM"|"STIKMI", timestamp: ISO, data: {...} }
 */
function doPost(e) {
  try {
    var payload;
    if (e.parameter && e.parameter.payload) {
      payload = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      // FormData via no-cors: Apps Script tidak otomatis parse FormData,
      // jadi kita coba parse sebagai JSON atau cari "payload=".
      var raw = e.postData.contents;
      if (e.postData.type === "application/x-www-form-urlencoded") {
        var m = raw.match(/payload=([^&]+)/);
        if (m) payload = JSON.parse(decodeURIComponent(m[1].replace(/\+/g, " ")));
      } else {
        payload = JSON.parse(raw);
      }
    }

    if (!payload || !payload.formType) {
      return jsonOut({ result: "error", message: "Payload tidak valid" });
    }

    var formType = payload.formType;
    if (!SHEET_COLUMNS[formType]) {
      return jsonOut({ result: "error", message: "formType tidak dikenal: " + formType });
    }

    // Simpan ke spreadsheet
    var ss = getSpreadsheet();
    appendRow(ss, formType, payload);
    appendRowAll(ss, payload);

    return jsonOut({ result: "success", message: "Data tersimpan", formType: formType });
  } catch (err) {
    return jsonOut({ result: "error", message: String(err) });
  }
}

/**
 * Handler GET — dipakai admin untuk ambil daftar semua submission.
 * URL: <WEB_APP_URL>?action=list&password=XXX
 */
function doGet(e) {
  var p = e.parameter || {};
  if (p.action === "list") {
    if (ADMIN_PASSWORD && p.password !== ADMIN_PASSWORD) {
      return jsonOut({ result: "error", message: "Unauthorized" });
    }
    var ss = getSpreadsheet();
    var all = readAll(ss);
    return jsonOut(all);
  }
  // health check
  return jsonOut({ result: "ok", message: "Formulir YMJ API aktif", time: new Date().toISOString() });
}

/* ---------- Spreadsheet helpers ---------- */

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  // buat baru bila belum ada ID
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SS_ID");
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* lanjut buat baru */ }
  }
  var ss = SpreadsheetApp.create("Rekap Pendaftaran YMJ");
  props.setProperty("SS_ID", ss.getId());
  SPREADSHEET_ID = ss.getId();
  return ss;
}

function ensureSheet(ss, name, columns) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  // header row
  var headerRange = sh.getRange(1, 1, 1, columns.length);
  var existingHeader = headerRange.getValues()[0];
  var isEmpty = existingHeader.every(function (v) { return v === ""; });
  if (isEmpty) {
    headerRange.setValues([columns]).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
  return sh;
}

function appendRow(ss, formType, payload) {
  var columns = SHEET_COLUMNS[formType];
  var sh = ensureSheet(ss, formType, columns);

  var data = payload.data || {};
  var row = columns.map(function (col) {
    var v;
    if (col === "timestamp") v = payload.timestamp || new Date().toISOString();
    else v = data[col];

    if (Array.isArray(v)) v = v.join("; ");
    if (v === undefined || v === null) v = "";
    return String(v);
  });

  sh.appendRow(row);
}

function appendRowAll(ss, payload) {
  var allColumns = ["timestamp", "formType", "data_json"];
  var sh = ensureSheet(ss, "All", allColumns);
  sh.appendRow([
    payload.timestamp || new Date().toISOString(),
    payload.formType,
    JSON.stringify(payload.data || {})
  ]);
}

function readAll(ss) {
  var out = [];
  ["SMJ", "SMKM", "STIKMI"].forEach(function (formType) {
    var sh = ss.getSheetByName(formType);
    if (!sh) return;
    var columns = SHEET_COLUMNS[formType];
    var lastRow = sh.getLastRow();
    if (lastRow < 2) return; // header only
    var values = sh.getRange(2, 1, lastRow - 1, columns.length).getValues();
    values.forEach(function (row) {
      var d = {};
      columns.forEach(function (col, i) { d[col] = row[i]; });
      out.push({
        formType: formType,
        timestamp: d.timestamp instanceof Date ? d.timestamp.toISOString() : String(d.timestamp),
        data: d
      });
    });
  });
  return out;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Opsional: test dari editor ---------- */
function testInsert() {
  var payload = {
    formType: "SMJ",
    timestamp: new Date().toISOString(),
    data: { nama_lengkap: "Test User", jenis_kelamin: "L", alamat: "Jl. Test" }
  };
  var ss = getSpreadsheet();
  appendRow(ss, "SMJ", payload);
  appendRowAll(ss, payload);
  Logger.log("Inserted. Spreadsheet ID: " + ss.getId());
}
