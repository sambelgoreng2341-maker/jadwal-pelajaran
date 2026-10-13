# Panduan Menjalankan Server Lokal Jadwal Santri IIQBS

Dokumen ini berisi panduan praktis untuk menjalankan aplikasi di komputer kantor / laptop / mini PC / Raspberry Pi yang terhubung ke jaringan WiFi pondok pesantren.

---

### Keuntungan Server Lokal di Pesantren:
1. **100% Bebas Kuota & Internet Luar**: Jika koneksi Indihome / Starlink / provider pondok putus, jadwal dan bel di seluruh TV tetap berfungsi lancar.
2. **Sinkronisasi Instan Tanpa Delay**: Perubahan jadwal atau bel manual langsung bunyi seketika di semua kelas.
3. **Gratis Tanpa Biaya Server**: Menggunakan komputer atau laptop yang sudah ada di kantor pondok.

---

### Langkah Cepat Menjalankan (Untuk Komputer Windows):

1. **Unduh Proyek ini ke Komputer Kantor**:
   - Pastikan komputer sudah terpasang [Node.js](https://nodejs.org) (versi 18 atau lebih baru).

2. **Jalankan File Otomatis**:
   - Cukup klik 2x (double click) pada berkas:
     ```
     start-server.bat
     ```
   - Berkas ini otomatis menyiapkan aplikasi dan menampilkan alamat IP yang bisa dibuka.

3. **Buka di Smart TV / Tablet Kelas**:
   - Sambungkan Smart TV ke WiFi yang sama dengan komputer kantor.
   - Buka browser TV, lalu ketik alamat yang muncul di jendela server, contoh:
     ```
     http://192.168.1.50:3000
     ```
   - Layar TV otomatis menampilkan jadwal berdampingan (Kelas 1&2 dan Kelas 3).
   - Tekan tombol **Mode Bersih (C)** atau **Fullscreen** di TV.

---

### Untuk Komputer Linux / Raspberry Pi:
Buka Terminal dan jalankan:
```bash
chmod +x start-server.sh
./start-server.sh
```

---

### Menjalankan Server Otomatis saat Komputer Nyala (Opsional):
- **Windows**: Buat *shortcut* dari berkas `start-server.bat`, lalu masukkan ke folder `shell:startup` (tekan `Win + R` -> ketik `shell:startup`).
- **Linux / Raspberry Pi**: Gunakan `pm2` (`pm2 start server.ts --name iiqbs-jadwal` dan `pm2 startup`).
