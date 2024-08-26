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
        SELECT id, product_name, siparis_adeti, price, size, photograph, table_name
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

        // Kargo ücreti (sabit bir değer olarak alabilirsiniz, örneğin $100)
        const kargoUcreti = 100;

        // Toplam fiyat
        const toplamFiyat = sepetToplami + kargoUcreti;

        // Checkout sayfasını render et
        res.render('checkout', {
            products: results,
            sepetToplami: sepetToplami,
            kargoUcreti: kargoUcreti,
            toplamFiyat: toplamFiyat,
            message: req.flash('success') // Başarı mesajını ekleyin
        });
    });
});

// Ödeme yapma işlemi için rota
router.post('/checkout', (req, res) => {
    const userId = req.session.userId; // Oturumda tanımlanan kullanıcı ID'si

    if (!userId) {
        return res.redirect('/login-signup'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    }

    // Sepetteki ürünleri almak için SQL sorgusu
    const selectQuery = `
        SELECT p_id, product_name, siparis_adeti, price, size, photograph, table_name, number
        FROM cart
        WHERE user_id = ?
    `;

    db.query(selectQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server Error');
        }

        // `satis_tablosu` tablosuna ekleme işlemi için SQL sorgusu
        const insertQuery = `
            INSERT INTO satis_tablosu (user_id, product_name, satilan_adet, p_id, table_name, toplam_fiyat, price, size, photograph, durum)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // `satis_tablosu` tablosuna ekleme işlemini gerçekleştirin
        results.forEach(item => {
            const values = [
                userId, // user_id (oturumu başlatan kullanıcının ID'si)
                item.product_name,
                item.siparis_adeti,
                item.p_id, // p_id
                item.table_name, // table_name (cart tablosundan alınan bilgi)
                item.siparis_adeti * item.price, // toplam_fiyat
                item.price,
                item.size,
                item.photograph,
                'Siparişiniz Hazırlanıyor'
            ];

            db.query(insertQuery, values, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server Error');
                }
            });

            // Dinamik olarak tablo adını kullanarak number değerini güncelle
            const updateQuery = `
                UPDATE ${item.table_name}
                SET number = number - ?
                WHERE id = ?
            `;

            db.query(updateQuery, [item.siparis_adeti, item.p_id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server Error');
                }
            });
        });

        // Sepeti temizleme
        const deleteQuery = `DELETE FROM cart WHERE user_id = ?`;
        db.query(deleteQuery, [userId], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server Error');
            }

            // Ödeme işlemi tamamlandığında başarı mesajı ve yönlendirme
            req.flash('message', 'Ödeme başarıyla tamamlandı');
            res.redirect('/checkout'); // Başarı mesajı ile checkout sayfasına yönlendir
        });
    });
});

module.exports = router;
