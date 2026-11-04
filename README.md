Ruang Baca — UTS Pemrograman Web 1
LINK YOUTUBE : https://youtu.be/lJDKvAnL1-c

HALAMAN LOGIN
<img width="944" height="473" alt="Cuplikan layar 2026-11-05 001835" src="https://github.com/user-attachments/assets/d059efa9-6712-4731-a9ab-d68a28562482" />

DASHBOARD
<img width="950" height="473" alt="Cuplikan layar 2026-11-05 022901" src="https://github.com/user-attachments/assets/97b8dee1-d96e-4f57-8ece-e436b83868e0" />

FITUR FITURNYA
<img width="768" height="474" alt="Cuplikan layar 2026-11-05 023000" src="https://github.com/user-attachments/assets/d59def73-1f0c-4f45-a2d1-7a68692ed165" />

<img width="769" height="472" alt="Cuplikan layar 2026-11-05 023011" src="https://github.com/user-attachments/assets/0f2c70a5-89eb-404c-99a3-d34e940d35a9" />

<img width="765" height="472" alt="Cuplikan layar 2026-11-05 023019" src="https://github.com/user-attachments/assets/12faf149-ea41-436e-97af-d53a31120da2" />

<img width="767" height="472" alt="Cuplikan layar 2026-11-05 023030" src="https://github.com/user-attachments/assets/c6883cde-aef2-4c51-8be4-6f8f8f6db1f3" />

<img width="765" height="473" alt="Cuplikan layar 2026-11-05 023039" src="https://github.com/user-attachments/assets/90607e53-ee4e-46e1-a7f4-14bbca58a593" />


Menjalankan
1. Buka folder `ruang-baca` di VSCode.
2. Buka `index.html` atau `login.html` dengan Chrome. Bisa juga memakai ekstensi Live Server.
3. Login dengan email `rina@gmail.com` dan password `rina123`.

Akun lain dari data asli: `agus@gmail.com` / `agus123`, `siti@gmail.com` / `siti123` (Admin).

Halaman dan fitur
- login.html: validasi akun, peringatan salah login, modal daftar dan lupa password.
- dashboard.html: sapaan waktu lokal, ringkasan dan navigasi.
- stok.html: katalog dari data.js, pencarian, pengurutan, tampilan tabel/kartu dan tambah baris stok dengan DOM.
- checkout.html: tambah/ubah/hapus jumlah pesanan, validasi pemesan, pembayaran simulasi, konfirmasi dan pengurangan stok.
- tracking.html: cari DO `20230012`, `20230013`, atau DO dari pesanan baru.
- laporan.html: ringkasan pesanan dan cetak laporan.
- history.html: riwayat detail pemesanan.

Struktur
HTML, `style.css`, `script.js`, `data.js`, dan `img/`.
File data.js asli tidak diubah. Gambar PAUD juga disertakan sebagai `paud_perkembangan.jpeg` agar sesuai path asli pada data.js.
Tidak memerlukan framework, instalasi, database, atau koneksi internet.

Penyimpanan dan batasan demo
Data perubahan disimpan di localStorage browser; sesi login disimpan di sessionStorage. Gunakan browser dan alamat yang sama untuk melihat perubahan. Menjalankan lewat Live Server memberi penyimpanan yang lebih konsisten. Akun pendaftaran adalah akun demo dan password tersimpan secara lokal; jangan memakai password penting. Ini bukan sistem autentikasi produksi.
Pemesanan, ongkir Rp15.000, pembayaran dan pemulihan password adalah simulasi; tidak mengirim email atau memproses uang. Pesanan baru tetap Diproses tanpa pembaruan server. Data tracking asli tetap dipakai, termasuk status Dikirim pada DO 20230013; tahap Diterima ditunjukkan berdasarkan log Selesai Antar.
Laporan/riwayat akun biasa memuat pesanannya sendiri; admin melihat semua pesanan yang dibuat di browser yang sama. Data pengiriman dummy disediakan untuk latihan pencarian.
