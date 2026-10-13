#!/bin/bash
# Script menjalankan server lokal pesantren di Linux / Raspberry Pi / Ubuntu

echo "============================================================"
echo "  SERVER JADWAL HARIAN SANTRI IIQBS - PONDOK PESANTREN"
echo "  Jaringan Lokal Intranet / WiFi Pesantren"
echo "============================================================"
echo ""

# Pastikan di direktori kerja aplikasi
cd "$(dirname "$0")"

echo "[1/2] Membangun berkas produksi..."
npm run build

echo "[2/2] Menjalankan server lokal di port 3000..."
echo ""
echo "Server siap diakses di jaringan lokal:"
hostname -I | awk '{print ">> http://" $1 ":3000"}'
echo ""
echo "Tekan Ctrl+C untuk menghentikan server."
echo "============================================================"

NODE_ENV=production npm start
