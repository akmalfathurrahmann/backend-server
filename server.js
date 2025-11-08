// server.js (Backend Node.js - FINAL)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const Api = require('routeros-api').Api; // Uncomment jika siap integrasi MikroTik
// const axios = require('axios'); // Uncomment jika siap integrasi QRIS

const app = express();
const PORT = 3000;
// const HOST = '192.168.1.3'; // Jika Anda ingin binding ke IP spesifik, uncomment ini.

app.use(cors()); 
app.use(bodyParser.json());

// =================================================================
// DATA VOUCHER & CONFIG
// =================================================================
const MIKROTIK_CONFIG = { host: 'IP_MIKROTIK_ANDA', user: 'USER_HOTSPOT', password: 'PASSWORD_HOTSPOT', port: 8728 };

// Data Harga Voucher: 5 jam 2rb, 7 jam 3rb, 12 jam 4rb, 1 hari 5rb
const VOUCHER_PRICES = [
    { code: 'C5H', duration: '5 Jam', price_mandiri: 2000, price_sub: 1500 },
    { code: 'C7H', duration: '7 Jam', price_mandiri: 3000, price_sub: 2500 },
    { code: 'C12H', duration: '12 Jam', price_mandiri: 4000, price_sub: 3500 },
    { code: 'C1D', duration: '1 Hari', price_mandiri: 5000, price_sub: 4500 },
];

// Fungsi untuk membuat kode voucher format PREFIX + 9 Digit Random
function generateVoucherCode(codePrefix) {
    const characters = '0123456789';
    let result = codePrefix;
    for (let i = 0; i < 9; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
// =================================================================


// API 1: Mengambil Daftar Harga Voucher
app.get('/api/vouchers', (req, res) => {
    const vouchers = VOUCHER_PRICES.map(v => ({
        code: v.code,
        duration: v.duration,
        price: v.price_mandiri,
        label: `${v.duration} - Rp ${v.price_mandiri.toLocaleString('id-ID')}`
    }));
    res.json(vouchers);
});


// API 2: Generate Pembayaran QRIS (SIMULASI)
app.post('/api/qris/generate', async (req, res) => {
    res.json({ success: true, order_id: `ORDER-${Date.now()}`, qris_image_url: 'https://placehold.co/200x200/FFC700/121212.png?text=QRIS', amount: req.body.amount || 5000, expiry: 300 });
});


// API BARU: Poin 17 - Endpoint yang dipanggil setelah pembayaran LUNAS (SIMULASI)
app.post('/api/qris/success', async (req, res) => {
    const { voucherCodePrefix } = req.body; 
    
    // Buat Kode Voucher Unik Berdasarkan Prefix (C1D, C5H, dll.)
    const newVoucherCode = generateVoucherCode(voucherCodePrefix);
    
    // Di sini seharusnya ada logika koneksi ke MikroTik untuk membuat user
    
    res.json({ success: true, voucher: newVoucherCode, message: "Pembayaran lunas. Voucher Anda siap digunakan." });
});


// API 3: Validasi dan Aktivasi Voucher MikroTik (SIMULASI LOGIN)
app.post('/api/voucher/activate', async (req, res) => {
    const { voucherCode } = req.body;
    
    // SIMULASI: Cek apakah kode voucher memiliki prefix yang valid
    const validPrefixes = VOUCHER_PRICES.map(v => v.code);
    const prefix = voucherCode.substring(0, voucherCode.length - 9);

    if (validPrefixes.includes(prefix)) {
        res.json({ success: true, message: "Koneksi berhasil! (SIMULASI)" });
    } else {
        res.status(400).json({ success: false, message: "Kode voucher tidak valid." });
    }
});


// Jalankan server
// Jika Anda menggunakan HOST (misalnya 192.168.1.3), uncomment baris 1, 3, dan 4 di bawah ini, lalu comment baris 5
app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});