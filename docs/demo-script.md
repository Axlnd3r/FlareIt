# 🎬 FlareIt — Hackathon Demo & Presentation Script

> **Flare Summer Signal Hackathon** | Track: Interoperable Asset Products  
> **Network**: Flare Coston2 Testnet (Chain ID 114)  
> **Target Audience**: Judges & Remittance Users (Indonesian TKI & Families)

---

## ⏱️ Timeline Presentasi (Total 3 Menit)

| Waktu | Durasi | Bagian | Tujuan Visual |
|---|---|---|---|
| 00:00 - 00:45 | 45 dtk | **Problem & Value Proposition** | Landing Page (`/`) — Masalah $17.25B remitansi TKI & potongan fee 7% |
| 00:45 - 01:30 | 45 dtk | **Onboarding & Live FTSO Rate** | Mint FXRP (`/onboarding`) & Rate Display (`/send`) |
| 01:30 - 02:15 | 45 dtk | **Instant Transfer & Recipient View** | Kirim Form (`/send`) → Dashboard Penerima (`/dashboard`) |
| 02:15 - 03:00 | 45 dtk | **Simulasi QRIS & Transparansi FDC** | QRIS Demo (`/qris`) + Penjelasan FDC Architecture |

---

## 📜 Script Narasi Klik-per-Klik

### 1. Intro & Problem Definition (00:00 - 00:45)
- **Halaman**: Landing Page (`http://localhost:3000/`)
- **Action**: Scroll ke banner statistik ($17.25B TKI remittance).
- **Narasi**:
  > *"Halo juri Flare Summer Signal. Pekerja Migran Indonesia (TKI) mengirimkan lebih dari $17.25 Miliar USD setiap tahunnya. Sayangnya, transfer tradisional via Western Union dan bank memotong hingga 5-10% melalui biaya transaksi dan mark-up kurs tersembunyi.*
  >
  > *Memperkenalkan **FlareIt** — rail remitansi trustless bertenaga **FAssets (FXRP)** dan orakel **FTSO v2** di Flare Network."*

---

### 2. Onboarding & Live FTSO Rate (00:45 - 01:30)
- **Halaman**: Onboarding (`/onboarding`) lalu Form Pengiriman (`/send`)
- **Action**:
  1. Klik tombol **Connect Wallet** (MetaMask terhubung ke Coston2).
  2. Buka `/onboarding`, tunjukkan saldo FXRP yang diambil dari Faucet.
  3. Buka `/send`, highlight komponen **RateDisplay**.
- **Narasi**:
  > *"Pengirim di luar negeri mengonversi XRP menjadi FXRP via FAssets bridge. Di halaman ini, harga XRP/USD ditarik **real-time langsung secara on-chain dari FTSO v2** di smart contract `RateReader.sol`. Pengirim melihat kalkulasi IDR dan penghematan fee 7% secara transparan sebelum mengirim."*

---

### 3. Execution & Recipient Dashboard (01:30 - 02:15)
- **Halaman**: Send Form (`/send`) ke Recipient Dashboard (`/dashboard`)
- **Action**:
  1. Masukkan alamat Wallet Penerima di Indonesia + nominal FXRP (misal: 100 FXRP).
  2. Klik **Setujui FXRP** lalu **Kirim FXRP Sekarang**. Tunjukkan konfirmasi di explorer.
  3. Buka `/dashboard` dengan Wallet Penerima. Tunjukkan saldo bertambah dalam estimasi Rupiah (`Rp 1.706.969 IDR`).
- **Narasi**:
  > *"Setelah menekan Kirim, transaksi diproses secara instan di Coston2. Event `Sent` ter-emit dan di-indeks secara otomatis oleh backend kami. Keluarga penerima di Indonesia membuka **Dashboard Penerima**, melihat saldo langsung dalam nilai **Rupiah**, dan dapat membaca riwayat transaksi tanpa istilah crypto yang membingungkan."*

---

### 4. Stretch Add-on: QRIS Merchant & FDC Disclaimer (02:15 - 03:00)
- **Halaman**: Simulasi QRIS (`/qris`)
- **Action**:
  1. Klik **Pilih Merchant QRIS** (misal: Warung Makan Bu Sri).
  2. Klik **Simulasikan Scan & Bayar QRIS**. Tunjukkan animasi scanning & receipt sukses.
  3. Highlight badge *"Demo Simulation"* dan diagram FDC di bagian bawah.
- **Narasi**:
  > *"Sebagai fitur eksplorasi, kami menyajikan simulasi pembayaran merchant **QRIS**. Bagian ini kami tandai secara jujur sebagai simulasi karena integrasi merchant asli memerlukan kemitraan PJP berlisensi Bank Indonesia. Pasca-hackathon, **Flare Data Connector (FDC)** akan memverifikasi attestasi settlement off-chain PJP ini secara trustless. Terima kasih!"*

---

## 🛡️ Risk Mitigation / Backup Video
Jalankan flow di atas 3x berturut-turut lalu rekam layar menggunakan OBS / Loom sebagai video cadangan jika terjadi kendala RPC saat live judging.
