# 🧭 KirimFXRP — Build Blueprint for Vibe Coding Tools

> Dokumen ini dibuat untuk di-paste/dijadikan context ke AI coding tool (Claude Code, Cursor, dll). Ikuti urutan fase — jangan loncat fase sebelum fase sebelumnya lulus checklist testing-nya.

---

## 0. Ground Rules Sebelum Mulai Prompting

Berikan ini sebagai context di awal setiap sesi vibe coding, supaya tools tidak berhalusinasi:

- **Network**: Flare Coston2 Testnet
- **Chain ID Coston2**: `114`
- **RPC**: `https://coston2-api.flare.network/ext/C/rpc`
- **Block Explorer**: `https://coston2-explorer.flare.network`
- **Faucet**: Coston2 faucet resmi Flare (cari link terbaru di docs.flare.network sebelum mulai — jangan biarkan AI menebak address kontrak resmi. Selalu copy-paste address FAssets FXRP dan FTSO v2 registry dari docs resmi ke context sebelum minta generate kode yang berinteraksi dengannya.)
- **Bahasa kontrak**: Solidity ^0.8.x
- **Framework kontrak**: Foundry
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + wagmi/viem
- **Backend**: Node.js + Express (atau Next.js API routes kalau mau lebih simpel) + PostgreSQL/SQLite untuk indexing event

**Prinsip prompting**: satu file/satu fungsi per prompt, selalu minta test menyertai, selalu review sebelum lanjut ke fase berikutnya.

---

## 1. Struktur Folder Monorepo

```
kirimfxrp/
├── contracts/
│   ├── src/
│   │   ├── SendContract.sol
│   │   ├── RateReader.sol
│   │   ├── QrisSettlement.sol        # add-on, Fase 4
│   │   └── interfaces/
│   │       ├── IFAssetsFXRP.sol
│   │       └── IFtsoV2.sol
│   ├── test/
│   │   ├── SendContract.t.sol
│   │   ├── RateReader.t.sol
│   │   └── QrisSettlement.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   └── foundry.toml
│
├── backend/
│   ├── src/
│   │   ├── index.ts                  # entrypoint Express
│   │   ├── indexer/
│   │   │   └── eventListener.ts      # dengarkan event Sent() dari SendContract
│   │   ├── routes/
│   │   │   ├── transactions.ts       # GET riwayat transaksi per address
│   │   │   ├── rate.ts               # GET rate cache (fallback kalau frontend nggak read langsung on-chain)
│   │   │   └── qris.ts               # add-on, Fase 4
│   │   ├── db/
│   │   │   └── schema.sql
│   │   └── config.ts
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # landing
│   │   ├── onboarding/page.tsx       # mint XRP -> FXRP
│   │   ├── send/page.tsx             # form kirim
│   │   ├── dashboard/page.tsx        # recipient view
│   │   └── qris/page.tsx             # add-on, Fase 4
│   ├── components/
│   │   ├── WalletConnectButton.tsx
│   │   ├── RateDisplay.tsx
│   │   ├── SendForm.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── QrisScanSimulator.tsx     # add-on, Fase 4
│   ├── lib/
│   │   ├── contracts.ts
│   │   ├── wagmiConfig.ts
│   │   └── api.ts                    # fetch ke backend
│   └── package.json
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   └── demo-script.md
│
└── .gitignore
```

---

## 2. FASE 0 — Environment Setup

**Tujuan**: semua tool siap, wallet siap, address kontrak resmi Flare sudah dicatat.

Checklist:
- [ ] Install Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- [ ] Install Node.js LTS
- [ ] Buat 2 wallet dev baru (sender & recipient) — jangan pakai wallet asli
- [ ] Klaim C2FLR dari Coston2 faucet ke kedua wallet
- [ ] Catat di `docs/ARCHITECTURE.md`: address kontrak FAssets FXRP resmi, address FTSO v2 registry resmi (ambil dari docs.flare.network, bukan dari ingatan AI)
- [ ] Inisialisasi repo git + `.gitignore` (exclude `.env`, `node_modules`, `out/`, `cache/`)

**Prompt contoh ke vibe coding tool:**
> "Inisialisasi Foundry project di folder `contracts/`. Buat `foundry.toml` dengan RPC Coston2 (chain id 114). Jangan generate kontrak apapun dulu, cuma setup project."

---

## 3. FASE 1 — Smart Contract: MVP Core

### 3.1 `RateReader.sol`

**Tujuan**: baca live feed FTSO v2 untuk pasangan XRP/USD dan USD/IDR (kalau USD/IDR belum tersedia langsung di FTSO, cek feed yang ada dan sesuaikan — dokumentasikan asumsi ini).

Spesifikasi fungsi:
```solidity
function getXrpUsdRate() external view returns (uint256 price, uint64 timestamp);
function getUsdIdrRate() external view returns (uint256 price, uint64 timestamp);
function getXrpIdrRate() external view returns (uint256 price, uint64 timestamp); // hasil kalkulasi dari 2 di atas
```

Checklist test:
- [ ] Return value masuk akal (bukan 0, bukan stale > threshold waktu tertentu)
- [ ] Revert kalau feed stale/tidak valid

**Prompt contoh:**
> "Buat `RateReader.sol` yang membaca feed FTSO v2 untuk XRP/USD menggunakan interface `IFtsoV2` di alamat [ALAMAT_RESMI]. Sertakan fungsi `getXrpUsdRate()` yang return price dan timestamp. Sertakan juga test Foundry yang fork Coston2 dan assert price bukan nol."

### 3.2 `SendContract.sol`

**Tujuan**: terima FXRP dari sender, catat & teruskan ke recipient, emit event untuk indexing backend.

Spesifikasi:
```solidity
event Sent(address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp);

function send(address recipient, uint256 amount) external;
function getSentHistory(address user) external view returns (Transaction[] memory); // optional, atau full lewat backend indexer
```

Checklist test:
- [ ] Transfer FXRP berhasil, saldo sender berkurang, recipient bertambah
- [ ] Event `Sent` ter-emit dengan data benar
- [ ] Revert kalau saldo tidak cukup
- [ ] Revert kalau amount = 0 atau recipient = address(0)

**Prompt contoh:**
> "Buat `SendContract.sol` yang menerima transfer token ERC20 (FXRP, alamat [ALAMAT_RESMI]) dari sender ke recipient lewat fungsi `send()`. Emit event `Sent`. Sertakan test Foundry untuk transfer sukses, revert saldo kurang, dan revert recipient address(0)."

### 3.3 Deploy Fase 1

- [ ] Deploy `RateReader.sol` dan `SendContract.sol` ke Coston2
- [ ] Verifikasi kontrak di block explorer
- [ ] Catat kedua address di `frontend/lib/contracts.ts` dan `backend/src/config.ts`

---

## 4. FASE 2 — Backend: Indexing & API

**Tujuan**: backend mendengarkan event on-chain dan menyajikan data siap-pakai ke frontend (recipient dashboard nggak perlu tau cara baca event mentah).

### 4.1 Event Indexer (`indexer/eventListener.ts`)
- Dengarkan event `Sent` dari `SendContract`
- Simpan ke database: `sender`, `recipient`, `amount`, `timestamp`, `tx_hash`

### 4.2 API Routes
```
GET /api/transactions/:address       -> riwayat transaksi user (sender atau recipient)
GET /api/rate                        -> rate terbaru (cache dari RateReader, refresh tiap N detik)
```

### 4.3 Database schema minimal
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(42) NOT NULL,
  recipient VARCHAR(42) NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

Checklist test:
- [ ] Kirim transaksi test di kontrak → cek muncul di DB dalam beberapa detik
- [ ] API `/api/transactions/:address` return data benar untuk sender maupun recipient
- [ ] API `/api/rate` return angka yang sinkron dengan on-chain

**Prompt contoh:**
> "Buat Express server dengan event listener yang subscribe ke event `Sent` dari kontrak [ALAMAT] di Coston2 (pakai viem/ethers), simpan ke tabel `transactions` di SQLite. Buat endpoint `GET /api/transactions/:address` yang return semua transaksi di mana address adalah sender atau recipient."

---

## 5. FASE 3 — Frontend: MVP Core Flow

Urutan build (ikuti urutan user journey, bukan urutan file):

### 5.1 Wallet Connect
- [ ] Setup wagmi config untuk Coston2
- [ ] Tombol connect wallet berfungsi, tampilkan address & saldo native token

### 5.2 Onboarding Page (`/onboarding`)
- [ ] UI jelasin: "Convert XRP kamu jadi FXRP untuk mulai kirim"
- [ ] Integrasi ke flow mint/deposit FAssets resmi (ikuti dokumentasi FAssets — jangan bikin mock mint sendiri)
- [ ] Tampilkan saldo FXRP setelah berhasil

### 5.3 Send Page (`/send`)
- [ ] Form input: address recipient, jumlah FXRP
- [ ] `RateDisplay` component: tarik rate dari `RateReader` (langsung on-chain atau via `/api/rate`), tampilkan estimasi IDR yang diterima
- [ ] Tombol kirim memanggil `SendContract.send()`
- [ ] Tampilkan status transaksi (pending/success) + link ke block explorer

### 5.4 Dashboard Page (`/dashboard`)
- [ ] Tampilkan saldo FXRP + estimasi IDR-equivalent (pakai rate terbaru)
- [ ] `TransactionHistory` component: fetch dari `/api/transactions/:address`, tampilkan dalam bahasa awam ("Diterima Rp X dari [alamat terpotong], 2 menit lalu")

Checklist test end-to-end:
- [ ] Wallet A connect → onboarding → mint FXRP
- [ ] Wallet A kirim ke Wallet B via `/send`, rate tampil benar
- [ ] Wallet B buka `/dashboard`, transaksi & saldo muncul benar
- [ ] Rekam video flow ini sebagai backup demo

**Prompt contoh:**
> "Buat halaman `/send` di Next.js App Router yang punya form kirim FXRP. Tarik rate dari komponen `RateDisplay` yang membaca `RateReader.sol` on-chain via wagmi `useReadContract`. Setelah submit, panggil `SendContract.send()` via `useWriteContract`, tampilkan status pending/success, dan link transaksi ke Coston2 explorer."

> **Checkpoint**: Sampai sini adalah MVP Core lengkap. Ini yang harus 100% jalan sebelum menyentuh Fase 4. Kalau waktu habis di sini, submission tetap kuat.

---

## 6. FASE 4 — Add-On: QRIS (Simulasi + Desain FDC)

**Prinsip penting**: fitur ini TIDAK boleh diklaim "working" secara penuh dalam submission. QRIS adalah sistem berlisensi Bank Indonesia — integrasi merchant asli butuh partnership PJP yang tidak feasible dalam waktu hackathon. Bangun ini sebagai **simulasi UI yang credible + desain arsitektur FDC** yang didokumentasikan jelas.

### 6.1 `QrisScanSimulator.tsx` (frontend)
- [ ] UI simulasi scan QR merchant (bisa pakai QR dummy/statis)
- [ ] Setelah "scan", tampilkan flow: saldo FXRP recipient berkurang sejumlah nominal, status "Pembayaran berhasil (simulasi)"
- [ ] Label jelas di UI: "Demo simulation — real merchant settlement requires licensed payment partner integration"

### 6.2 `QrisSettlement.sol` (kontrak, opsional kalau waktu cukup)
- Kontrak sederhana yang mencatat "intent to pay" merchant (bukan settlement asli ke rail QRIS)
```solidity
event PaymentIntent(address indexed payer, string merchantId, uint256 amount, uint256 timestamp);
function recordPaymentIntent(string calldata merchantId, uint256 amount) external;
```
- Ini menunjukkan pola bagaimana FDC nantinya akan attest hasil settlement off-chain (QRIS) balik ke on-chain — dijelaskan di `ARCHITECTURE.md` sebagai desain, bukan diklaim live.

### 6.3 Dokumentasi Desain FDC (di `docs/ARCHITECTURE.md`, bukan kode)
Jelaskan alur yang *akan* dibangun pasca-hackathon:
1. Recipient bayar merchant via QRIS (uang keluar dari saldo FXRP, dikonversi ke IDR oleh PJP partner)
2. PJP partner mengonfirmasi settlement ke API off-chain
3. **FDC** melakukan attestasi bahwa settlement itu benar terjadi, hasil attestasi ditulis on-chain
4. Kontrak `QrisSettlement.sol` mengunci/melepas dana berdasarkan attestasi FDC tersebut (trustless finality)

Checklist:
- [ ] UI simulasi jalan mulus tanpa bug
- [ ] Label "simulasi" terlihat jelas, tidak menyesatkan
- [ ] Diagram FDC ada di dokumentasi, dijelaskan dengan bahasa yang bisa dipahami juri non-teknis

**Prompt contoh:**
> "Buat komponen React `QrisScanSimulator.tsx` yang menampilkan UI simulasi scan QR code, lalu animasi loading 2 detik, lalu tampilkan status sukses dengan badge kecil bertuliskan 'Demo Simulation'. Kurangi state saldo FXRP di context secara lokal untuk efek visual, tidak perlu call kontrak."

---

## 7. FASE 5 — Polish & Submission Readiness

Checklist akhir:
- [ ] `README.md` final (sudah ada versi sebelumnya, sinkronkan dengan hasil build asli)
- [ ] `ARCHITECTURE.md` dengan diagram alur MVP Core + desain QRIS/FDC
- [ ] Video demo backup (jaga-jaga live demo gagal saat presentasi)
- [ ] Semua address kontrak final tercatat & terverifikasi di explorer
- [ ] `demo-script.md`: urutan klik-per-klik untuk presentasi, termasuk kalimat transisi saat masuk ke bagian simulasi QRIS ("bagian ini kami simulasikan karena integrasi merchant asli butuh partnership PJP berlisensi — berikut desain teknis lengkapnya...")
- [ ] Cek ulang semua klaim di README match dengan yang benar-benar jalan di demo — jangan overclaim

---

## 8. Ringkasan Urutan Fase (untuk ditempel di papan/tracker)

1. **Fase 0** — Setup environment & catat address resmi Flare
2. **Fase 1** — `RateReader.sol` + `SendContract.sol`, deploy & verify
3. **Fase 2** — Backend indexer + API transactions/rate
4. **Fase 3** — Frontend: connect → onboarding → send → dashboard (INI YANG WAJIB SELESAI)
5. **Fase 4** — Add-on QRIS: simulasi UI + desain FDC (kerjakan HANYA setelah Fase 3 solid)
6. **Fase 5** — Polish, dokumentasi, video backup, submission
