# FlareIt — Video Demo & Text-to-Speech Production Guide

Dokumen ini adalah panduan utama untuk merekam demo kompetisi FlareIt. Ikuti urutan waktunya, rekam visual dalam beberapa klip, lalu susun dengan naskah TTS bahasa Inggris di bawah. Target akhir adalah video **2:50–3:00 menit** yang membuktikan satu perjalanan aset utuh:

```text
XRP in Xaman
  → XRPL payment to the FAssets Core Vault
  → FDC-backed direct mint
  → FTestXRP on Flare Coston2
  → P2P transfer or merchant checkout
  → indexed event and explorer-verifiable receipt
```

## 1. Pesan yang harus diingat juri

Setelah video selesai, juri harus dapat mengulang tiga pesan berikut:

1. **FlareIt makes XRP usable, not merely movable.**
2. **FAssets, FDC, FTSO, dan Coston2 dipakai sebagai bagian inti produk.**
3. **Perjalanan dari XRPL sampai receipt Flare sudah bekerja dan dapat diverifikasi.**

Gunakan positioning berikut secara konsisten:

> Xaman secures and signs XRP. FlareIt turns that XRP into usable FXRP and orchestrates its journey into verifiable applications on Flare.

Jangan menyebut FlareIt sebagai wallet baru atau pesaing Xaman. Xaman adalah signing layer XRPL; FlareIt adalah product and orchestration layer.

## 2. Bukti live yang sudah tersedia

### Deployment Coston2

| Contract | Address |
|---|---|
| RateReader | `0x7d53Ff07dE9F8b0d9911d90C0545992f4b7835Fc` |
| SendContract | `0xB06c800Edd7DfFCAA6fa894CE9B2FDD9a7C7BEE6` |
| MerchantPayment | `0xE7ebAbD3bb94D7d6a649215F9Df0D66ad97f8224` |
| FTestXRP | `0x0b6A3645c240605887a5532109323A3E12273dc7` |
| Deployment block | `33924221` |

### Direct-mint run pertama

| Evidence | Value |
|---|---|
| XRPL transaction | `754BE519F592C15959E8BC19A9626D169192CAC30F5741F5FA412636F9FA4784` |
| XRPL result | `tesSUCCESS`, validated |
| XRPL ledger | `19848964` |
| Core Vault | `rDhpmiPq4BVBDWMVdSrmkgt8thKyRzGV1p` |
| Gross payment | `10 XRP Testnet` |
| Coston2 recipient | `0xCd9c2d8ecca5B04Eb15F528d36823a0e3547EAFb` |
| Mint outcome | `9.800000 FTestXRP` |

### Evidence yang harus dilengkapi sebelum final export

Ganti placeholder berikut dengan bukti publik dari transaksi Anda:

```text
SEND_APPROVAL_TX=<hash approval FTestXRP>
SEND_TX=<hash SendContract.send>
WALLET_B=<alamat penerima>
MERCHANT_WALLET=<alamat merchant>
MERCHANT_APPROVAL_TX=<hash approval MerchantPayment>
MERCHANT_PAYMENT_TX=<hash MerchantPayment.payMerchant>
MERCHANT_PAYMENT_ID=<invoice/payment ID>
```

Jangan isi placeholder dengan data contoh. Jika satu bukti belum ada, jangan klaim bagian tersebut sudah selesai.

## 3. Persiapan rekaman

### Wallet dan saldo

- **Wallet A / payer:** wallet Coston2 dengan FTestXRP dan C2FLR.
- **Wallet B / recipient:** wallet berbeda yang menerima transfer.
- **Wallet C / merchant:** wallet berbeda yang menerima merchant payment.
- **Xaman:** berada di XRPL Testnet dan memakai akun yang sudah aktif.

Jangan menggunakan satu wallet sebagai payer, recipient, dan merchant karena nilai demonstrasinya menjadi lebih lemah.

### Aplikasi

- Frontend dan backend sudah hidup.
- Backend `/health` menunjukkan `ready`.
- Indexer sudah mencapai block terbaru.
- FTSO rate muncul dengan indikator fresh.
- Semua URL explorer sudah dibuka di tab terpisah.
- Browser berada pada zoom 110–125%.
- Bookmark bar, notification, dan data pribadi disembunyikan.
- Xaman screen recording hanya menampilkan informasi transaksi publik.

### Format video

- Resolusi: `1920 × 1080`.
- Frame rate: `30 FPS`.
- Target: `2:50–3:00`.
- Bahasa TTS: English.
- Subtitle: English, burned-in atau file `.srt`.
- Kecepatan TTS: sekitar `0.95×` atau `125–135 words per minute`.
- Musik: tanpa musik atau instrumental sangat pelan, minimal 18 dB di bawah narasi.
- Gunakan jump cut pada waktu tunggu, tetapi jangan memotong bukti status confirmed/validated.

## 4. Timeline rekaman dan naskah TTS

Setiap bagian memiliki empat elemen:

- **Visual:** layar yang ditampilkan.
- **Aksi:** gerakan cursor atau transisi.
- **Overlay:** teks pendek pada video.
- **TTS:** kalimat yang dimasukkan ke text-to-speech.

### Scene 1 — Hook: masalah pengguna (`00:00–00:14`)

**Visual**

- Landing page FlareIt.
- Diagram animasi `XRP → FAssets → FXRP → Merchant`.
- Jangan mulai dengan terminal, MetaMask, atau halaman konfigurasi.

**Aksi**

- Mulai dari hero.
- Pan atau zoom perlahan menuju asset rail.

**Overlay**

```text
Moving XRP is easy.
Making XRP useful is not.
```

**TTS — Block 1**

> XRP is highly liquid, but using it in smart-contract applications still requires users to navigate multiple networks, protocol fees, transaction memos, and settlement steps. FlareIt turns that fragmented journey into one verifiable payment flow.

### Scene 2 — Produk dan positioning (`00:14–00:27`)

**Visual**

- Tetap di landing page.
- Sorot kartu Mint, Send, Dashboard, dan Merchant.

**Overlay**

```text
Onboard → Use → Prove
```

**TTS — Block 2**

> Xaman remains the secure XRPL signing wallet. FlareIt is the application layer that onboards XRP through FAssets, moves FXRP on Flare, and gives recipients and merchants verifiable delivery.

### Scene 3 — Prepare direct mint (`00:27–00:47`)

**Visual**

- Halaman `/onboarding`.
- Wallet recipient tersambung ke Coston2.
- Tekan `Siapkan payload`.
- Sorot Core Vault, amount, memo, mint fee, executor fee, dan estimated net.

**Aksi**

- Beri zoom singkat pada Core Vault dan memo.
- Beri highlight pada `9.8` estimated net.

**Overlay**

```text
Runtime AssetManager data
No hardcoded vault or fees
```

**TTS — Block 3**

> First, FlareIt reads the official FAssets Asset Manager at runtime. The Core Vault, minting fee, executor fee, and recipient memo are prepared from live protocol data, not hardcoded configuration.

### Scene 4 — Xaman and XRPL proof (`00:47–01:05`)

**Visual**

- Potong ke Xaman transaction details.
- Sorot network Testnet, destination Core Vault, `10 XRP`, memo, `tesSUCCESS`, validated ledger, dan transaction ID.
- Jangan memperlihatkan secret numbers atau account secret.

**Overlay**

```text
XRPL Testnet · Validated · tesSUCCESS
```

**TTS — Block 4**

> The user signs a ten XRP Testnet payment in Xaman. The destination is the official Core Vault, and the memo encodes the Coston2 recipient. The XRPL transaction is validated, and an executor finalizes the FDC-backed direct mint.

### Scene 5 — Mint outcome (`01:05–01:15`)

**Visual**

- Kembali ke onboarding atau dashboard Wallet A.
- Tampilkan saldo `9.800000 FTestXRP`.
- Bila tersedia, tampilkan link XRPL transaction.

**Overlay**

```text
10 XRP → 9.8 FTestXRP
```

**TTS — Block 5**

> The same Coston2 wallet receives 9.8 FTestXRP. XRP has now become a programmable EVM asset on Flare.

### Scene 6 — Send and receive (`01:15–01:39`)

**Visual**

- Halaman `/send` dengan Wallet A.
- Tampilkan saldo dan estimasi IDR.
- Isi Wallet B dan `1 FXRP`.
- Gunakan potongan confirmation yang sudah direkam:
  1. `Approve FXRP` confirmed.
  2. `Send FXRP` confirmed.
- Buka receipt explorer sesaat.

**Overlay**

```text
Non-custodial
Exact approval → Contract transfer
```

**TTS — Block 6**

> The minted asset is immediately useful. FlareIt requests an exact token allowance, then transfers one FXRP to a second wallet through the deployed SendContract. Both actions produce independent Coston2 receipts, while the user keeps custody throughout the flow.

### Scene 7 — Evidence dashboard (`01:39–02:00`)

**Visual**

- Dashboard dengan event transaksi.
- Sorot saldo `8.800000`, estimasi IDR, FTSO rate, direction, amount, block number, dan explorer link.
- Jika memungkinkan, switch ke Wallet B untuk menunjukkan incoming balance dan event `+1 FXRP`.

**Overlay**

```text
On-chain balance
Indexed event
Public receipt
```

**TTS — Block 7**

> The dashboard is the evidence layer. It reads the token balance on-chain and shows the indexed Sent event, direction, amount, block, and explorer link. XRP-to-USD comes from FTSO version two. The IDR leg is clearly labeled as an off-chain reference, and stale FTSO data fails closed.

### Scene 8 — Merchant QR (`02:00–02:27`)

**Visual**

- Halaman `/merchant`.
- Merchant address harus berbeda dari payer.
- Isi `Rp25.000` dan `ORDER-001`.
- Tekan `Buat QR pembayaran`.
- Sorot exact FXRP amount, source, expiry, QR, dan reference.
- Potong ke approval dan payment confirmed.
- Tampilkan merchant receipt.

**Overlay**

```text
IDR-denominated invoice
FXRP settlement on Coston2
5-minute on-chain deadline
```

**TTS — Block 8**

> FlareIt then turns FXRP into merchant checkout. A merchant creates an IDR-denominated invoice. FlareIt derives the exact FXRP amount from a fresh rate, binds it to an order reference, and issues a five-minute QR invoice. The payer pays the merchant directly through the MerchantPayment contract, with expiry enforced on-chain.

### Scene 9 — Honest boundary (`02:27–02:38`)

**Visual**

- Tetap pada QR atau merchant receipt.
- Tampilkan boundary dalam satu card sederhana.

**Overlay**

```text
Today: FXRP settlement on Flare
Next: licensed PJP / QRIS adapter
```

**TTS — Block 9**

> This QR settles FXRP on Flare. Production Rupiah settlement through QRIS is a future adapter requiring a licensed Indonesian payment provider.

### Scene 10 — Why Flare and technical credibility (`02:38–02:52`)

**Visual**

- Diagram arsitektur sederhana.
- Tampilkan empat layer: Xaman/XRPL, FAssets/FDC, FTSO, Coston2 contracts and indexer.
- Tampilkan alamat kontrak dalam bentuk pendek.

**Overlay**

```text
FAssets / FDC · FTSO v2 · Coston2 · Verifiable events

18 contract tests
8 live Coston2 fork tests
4 backend tests
Production build passed
```

**TTS — Block 10**

> Flare is not a branding layer here. FAssets and FDC bring XRP into Flare. FTSO provides on-chain pricing. Three deployed Coston2 contracts execute asset movement and payment, while a restart-safe indexer turns events into recipient-facing evidence.

### Scene 11 — Close (`02:52–03:00`)

**Visual**

- Kembali ke hero FlareIt.
- Logo dan asset rail bergerak.
- Munculkan live demo URL dan repository URL.

**Overlay**

```text
FlareIt
From XRP to verifiable payments on Flare.
```

**TTS — Block 11**

> Xaman secures XRP. Flare makes XRP programmable. FlareIt makes it usable—from wallet to verified payment.

## 5. Full TTS script — copy-ready

Salin bagian di bawah ke TTS generator. Buat satu audio per paragraf agar timing mudah disesuaikan. Jangan menggabungkan seluruh naskah menjadi satu file jika editor perlu memotong waktu tunggu.

```text
XRP is highly liquid, but using it in smart-contract applications still requires users to navigate multiple networks, protocol fees, transaction memos, and settlement steps. FlareIt turns that fragmented journey into one verifiable payment flow.

Xaman remains the secure XRPL signing wallet. FlareIt is the application layer that onboards XRP through FAssets, moves FXRP on Flare, and gives recipients and merchants verifiable delivery.

First, FlareIt reads the official FAssets Asset Manager at runtime. The Core Vault, minting fee, executor fee, and recipient memo are prepared from live protocol data, not hardcoded configuration.

The user signs a ten XRP Testnet payment in Xaman. The destination is the official Core Vault, and the memo encodes the Coston2 recipient. The XRPL transaction is validated, and an executor finalizes the FDC-backed direct mint.

The same Coston2 wallet receives 9.8 FTestXRP. XRP has now become a programmable EVM asset on Flare.

The minted asset is immediately useful. FlareIt requests an exact token allowance, then transfers one FXRP to a second wallet through the deployed SendContract. Both actions produce independent Coston2 receipts, while the user keeps custody throughout the flow.

The dashboard is the evidence layer. It reads the token balance on-chain and shows the indexed Sent event, direction, amount, block, and explorer link. XRP-to-USD comes from FTSO version two. The IDR leg is clearly labeled as an off-chain reference, and stale FTSO data fails closed.

FlareIt then turns FXRP into merchant checkout. A merchant creates an IDR-denominated invoice. FlareIt derives the exact FXRP amount from a fresh rate, binds it to an order reference, and issues a five-minute QR invoice. The payer pays the merchant directly through the MerchantPayment contract, with expiry enforced on-chain.

This QR settles FXRP on Flare. Production Rupiah settlement through QRIS is a future adapter requiring a licensed Indonesian payment provider.

Flare is not a branding layer here. FAssets and FDC bring XRP into Flare. FTSO provides on-chain pricing. Three deployed Coston2 contracts execute asset movement and payment, while a restart-safe indexer turns events into recipient-facing evidence.

Xaman secures XRP. Flare makes XRP programmable. FlareIt makes it usable—from wallet to verified payment.
```

## 6. Pronunciation guide untuk TTS

Jika TTS mengucapkan istilah dengan buruk, ganti teks input sesuai kolom pronunciation. Subtitle tetap memakai ejaan asli.

| Istilah subtitle | Teks alternatif untuk TTS |
|---|---|
| FlareIt | Flare It |
| XRP | X R P |
| FXRP | F X R P |
| FTestXRP | F Test X R P |
| XRPL | X R P Ledger |
| FTSO | F T S O |
| FDC | F D C |
| Coston2 | Coston Two |
| Xaman | Xah-man |
| IDR | I D R |
| QRIS | Q R I S |

Gunakan voice yang tenang dan percaya diri. Hindari gaya iklan berlebihan. Beri jeda sekitar 200–350 milidetik setelah istilah penting seperti `FAssets`, `validated`, `FTSO`, dan `on-chain`.

## 7. Visual yang wajib ditonjolkan

### Onboarding dan Xaman

- Core Vault dibaca saat runtime.
- Gross amount, minting fee, executor fee, dan estimated net.
- Memo berisi recipient Coston2.
- XRPL network adalah Testnet.
- Transaction result `tesSUCCESS` dan `validated`.
- Transaction ID publik.
- Saldo berubah menjadi `9.800000 FTestXRP`.

### Send and receive

- Payer dan recipient adalah wallet berbeda.
- Exact approval dan send adalah dua receipt berbeda.
- Saldo Wallet A turun.
- Saldo Wallet B naik.
- Dashboard memperlihatkan direction dan explorer receipt.

Penerima tidak perlu menandatangani atau membayar gas untuk menerima FTestXRP. Untuk demo, switch ke Wallet B atau cari alamat Wallet B agar incoming event terlihat.

### Dashboard

- On-chain balance.
- Estimasi IDR yang jelas berlabel estimate.
- FTSO freshness/source.
- Event direction, amount, block, dan explorer link.
- Jangan hanya menampilkan dashboard kosong.

### Merchant QR

- Merchant address berbeda dari payer.
- Nominal IDR dan order reference.
- Exact FXRP amount.
- Five-minute expiry.
- Approval, payment confirmation, dan receipt.
- Sebut `FlareIt Merchant QR`, bukan production QRIS.

## 8. Shot list untuk editor

Rekam klip berikut secara terpisah dan beri nama file secara berurutan:

```text
01-landing-hook.mp4
02-onboarding-prepare.mp4
03-xaman-validated.mp4
04-mint-balance.mp4
05-send-approval.mp4
06-send-confirmed.mp4
07-dashboard-evidence.mp4
08-wallet-b-receive.mp4
09-merchant-create-qr.mp4
10-merchant-payment.mp4
11-explorer-receipts.mp4
12-architecture-and-tests.mp4
13-closing.mp4
```

Ambil screenshot cadangan dari setiap receipt. Jika network lambat saat recording, gunakan klip receipt yang sudah berhasil, tetapi jangan menyajikan transaksi lama sebagai transaksi baru tanpa disclosure pada evidence document.

## 9. Informasi yang tidak boleh terlihat

- Private key atau seed phrase.
- Xaman secret numbers.
- Xaman API secret.
- Isi lengkap `.env`.
- Wallet mainnet yang menyimpan aset nyata.
- Notification pribadi.
- Browser password manager atau autofill.
- QR yang mengandung rahasia.

Public wallet address, contract address, block number, dan transaction hash aman ditampilkan.

## 10. Klaim yang harus dihindari

Jangan mengatakan:

- “FlareIt is a production QRIS payment system.”
- “IDR is settled on-chain.”
- “All IDR pricing comes from FTSO.”
- “FlareIt replaces Xaman.”
- “The product is mainnet production-ready.”
- “The project is the first ever,” kecuali ada bukti kuat.

Gunakan kalimat yang tepat:

- “The QR settles FXRP on Flare.”
- “XRP-to-USD comes from FTSO v2; IDR is a labeled off-chain reference.”
- “Xaman is the secure XRPL signing layer.”
- “The current MVP is deployed on Coston2 testnet.”

## 11. Final export checklist

- [ ] Durasi tidak lebih dari batas submission.
- [ ] Voice dan subtitle sinkron.
- [ ] Semua angka dapat dibaca tanpa pause manual.
- [ ] Tiga wallet berbeda digunakan.
- [ ] XRPL transaction menunjukkan Testnet, validated, dan `tesSUCCESS`.
- [ ] Saldo FTestXRP hasil mint terlihat.
- [ ] Approval dan send receipt terlihat.
- [ ] Incoming event Wallet B terlihat.
- [ ] Merchant approval dan payment receipt terlihat.
- [ ] FTSO source/freshness terlihat.
- [ ] Boundary QRIS/PJP disebut tepat satu kali.
- [ ] Contract deployment atau explorer evidence terlihat.
- [ ] Tidak ada secret di video.
- [ ] Semua hash dicatat di `docs/evidence-runs.md`.
- [ ] Live demo URL dan repository URL muncul pada ending card.
- [ ] Video diuji dengan audio mati; subtitle masih menjelaskan alur.
- [ ] Video diuji pada layar ponsel; teks utama tetap terbaca.

## 12. Kalimat pitch pendek untuk halaman submission

### One-liner

> FlareIt turns XRP held in Xaman into spendable FXRP on Flare, then proves the complete journey from XRPL payment to recipient or merchant receipt.

### Thirty-second pitch

> XRP is easy to hold and transfer, but difficult to use in smart-contract applications. FlareIt provides one guided journey: sign an XRPL payment in Xaman, direct-mint through FAssets, receive FXRP on Flare, price it with FTSO, and use it for non-custodial transfers or merchant checkout. Every important step is backed by an XRPL transaction, a Coston2 receipt, or an indexed contract event.

### Closing line

> Xaman secures XRP. Flare makes XRP programmable. FlareIt makes it usable.
