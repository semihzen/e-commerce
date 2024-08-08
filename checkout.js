const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// MySQL veritabanı bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'e-commerce'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Sepet toplamını hesaplamak ve checkout sayfasını render etmek için rota
router.get('/checkout', (req, res) => {
    // Oturumdan kullanıcı ID'sini almak
    const userId = req.session.userId; // Oturumda tanımlanan kullanıcı ID'si

    if (!userId) {
        return res.redirect('/login-signup'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    }

    // Sepetteki ürünleri almak için SQL sorgusu
    const query = `
        SELECT product_name, siparis_adeti, price
        FROM cart
        WHERE user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server Error');
        }

        // Sepet ürünlerini işle
        let sepetToplami = 0;
        results.forEach(item => {
            sepetToplami += item.siparis_adeti * item.price;
        });

        // Kargo ücreti (sabit bir değer olarak alabilirsiniz, örneğin $10)
        const kargoUcreti = 100;

        // Toplam fiyat
        const toplamFiyat = sepetToplami + kargoUcreti;

        // Checkout sayfasını render et
        res.render('checkout', {
            products: results,
            sepetToplami: sepetToplami,
            kargoUcreti: kargoUcreti,
            toplamFiyat: toplamFiyat
        });
    });
});

module.exports = router;
