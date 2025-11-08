// server.js (FINAL - Server API + Web Server - Path Fixed)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 

const app = express();
// ❗ WAJIB: Render memberikan PORT lewat 'process.env.PORT'
const PORT = process.env.PORT || 3000; 

app.use(cors()); 
app.use(bodyParser.json());

// =================================================================
// 1. MENAYANGKAN FRONTEND (File Statis dari folder 'public')
// =================================================================
// Pastikan folder 'public' ada DI DALAM 'backend-server'
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// =================================================================
// 2. DATA VOUCHER & CONFIG (API Backend)
// =================================================================
const MIKROTIK_CONFIG = { host: 'IP_MIKROTIK_ANDA', user: 'USER_HOTSPOT', password: 'PASSWORD_HOTSPOT', port: 8728 };

const VOUCHER_PRICES = [
    { code: 'C5H', duration: '5 Jam', price_mandiri: 2000, price_sub: 1500 },
    { code: 'C7H', duration: '7 Jam', price_mandiri: 3000, price_sub: 2500 },
    { code: 'C12H', duration: '12 Jam', price_mandiri: 4000, price_sub: 3500 },
    { code: 'C1D', duration: '1 Hari', price_mandiri: 5000, price_sub: 4500 },
];

function generateVoucherCode(codePrefix) {
    const characters = '0123456789';
    let result = codePrefix;
    for (let i = 0; i < 9; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// =================================================================
// 3. API ENDPOINTS (Semua alamat '/api/...')
// =================================================================

app.get('/api/vouchers', (req, res) => {
    const vouchers = VOUCHER_PRICES.map(v => ({
        code: v.code,
        duration: v.duration,
        price: v.price_mandiri,
        label: `${v.duration} - Rp ${v.price_mandiri.toLocaleString('id-ID')}`
    }));
    res.json(vouchers);
});

app.post('/api/qris/generate', async (req, res) => {
    res.json({ success: true, order_id: `ORDER-${Date.now()}`, qris_image_url: 'https://placehold.co/200x200/FFC700/121212.png?text=QRIS', amount: req.body.amount || 5000, expiry: 300 });
});

app.post('/api/qris/success', async (req, res) => {
    const { voucherCodePrefix } = req.body; 
    const newVoucherCode = generateVoucherCode(voucherCodePrefix);
    res.json({ success: true, voucher: newVoucherCode, message: "Pembayaran lunas. Voucher Anda siap digunakan." });
});

app.post('/api/voucher/activate', async (req, res) => {
    const { voucherCode } = req.body;
    const validPrefixes = VOUCHER_PRICES.map(v => v.code);
    const prefix = voucherCode.substring(0, voucherCode.length - 9);

    if (validPrefixes.includes(prefix)) {
        res.json({ success: true, message: "Koneksi berhasil! (SIMULASI)" });
    } else {
        res.status(400).json({ success: false, message: "Kode voucher tidak valid." });
    }
});

// =================================================================
// 4. FALLBACK (Menangani 'Cannot GET /')
// =================================================================
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});


app.listen(PORT, () => {
    // Pesan ini akan muncul di Log Render
    console.log(`Server backend berjalan di port ${PORT}`);
});
