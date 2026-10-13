@echo off
title Server Jadwal Santri IIQBS (Lokal Pesantren)
echo ============================================================
echo   SERVER JADWAL HARIAN SANTRI IIQBS - PONDOK PESANTREN
echo   Jaringan Lokal Intranet / WiFi Pesantren
echo ============================================================
echo.

echo [1/3] Memeriksa dependensi...
call npm install --omit=dev

echo [2/3] Membangun berkas produksi...
call npm run build

echo [3/3] Menjalankan server lokal di port 3000...
echo.
echo Server aktif! Layar Smart TV di kelas/lorong dapat membuka:
echo http://localhost:3000 (dari komputer ini)
echo Atau gunakan IP Komputer ini di WiFi pondok (misal: http://192.168.1.X:3000)
echo.
echo Tekan Ctrl+C untuk menghentikan server.
echo ============================================================
echo.

call npm start
pause
