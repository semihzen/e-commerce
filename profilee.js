const express = require('express');
const router = express.Router();
const multer = require('multer');
const mysql = require('mysql');

// Veritabanı bağlantısı
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

// Oturum açan kullanıcının profil bilgilerini çekme
router.get('/myprofile', (req, res) => {
    const userId = req.session.userId;  // Oturumdaki kullanıcı ID'sini al

    // Profil ve satış bilgilerini almak için iki sorgu
    const profileQuery = 'SELECT name, surname, email, photograph, adres, telefonno FROM users WHERE id = ?';
    const salesQuery = `
        SELECT 
        satis_tablosu.id, 
        satis_tablosu.product_name, 
        satis_tablosu.satilan_adet, 
        satis_tablosu.toplam_fiyat, 
        users.adres,
        satis_tablosu.durum,
        satis_tablosu.photograph,
        satis_tablosu.table_name,
        satis_tablosu.p_id
    FROM 
        satis_tablosu
    JOIN 
        users ON satis_tablosu.user_id = users.id
    WHERE
        users.id = ? AND satis_tablosu.durum != 'sipariş iptal edildi'
`;

    // İlk sorgu: Profil bilgilerini çekme
    db.query(profileQuery, [userId], (err, profileResults) => {
        if (err) {
            return res.status(500).send('Veritabanı hatası.');
        }

        if (profileResults.length > 0) {
            const { name, surname, photograph, adres, telefonno, email } = profileResults[0];

            // İkinci sorgu: Satış bilgilerini çekme
            db.query(salesQuery, [userId], (err, salesResults) => {
                if (err) {
                    return res.status(500).send('Veritabanı hatası.');
                }

                // Fotoğraf verisini base64 formatına dönüştür
                const data = salesResults.map(item => {
                    if (item.photograph) {
                        item.photograph = `data:image/jpeg;base64,${item.photograph.toString('base64')}`;
                    }
                    return item;
                });

                // Verileri profile.ejs'ye render etme
                res.render('profile', {
                    name: name,
                    surname: surname,
                    photograph: photograph ? photograph.toString('base64') : null,
                    adres: adres,
                    telefonno: telefonno,
                    email: email,
                    data: data  // Satış bilgilerini gönderme
                });
            });

        } else {
            res.render('profile', {
                error: 'Giriş Yapmanız Gerekmektedir.',
                name: '',
                surname: '',
                photograph: '',
                adres: '',
                telefonno: '',
                email: '',
                data: []
            });
        }
    });
});

// Fotoğraf yüklemek için multer'ı ayarlama
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Fotoğraf yükleme ve veritabanına kaydetme
router.post('/upload-photo', upload.single('photo'), (req, res) => {
    const userId = req.session.userId;
    if (!req.file) {
        return res.status(400).send('Lütfen bir fotoğraf seçin.');
    }
    const photo = req.file.buffer;  // Fotoğrafı BLOB olarak al

    const query = 'UPDATE users SET photograph = ? WHERE id = ?';
    db.query(query, [photo, userId], (err, result) => {
        if (err) {
            return res.status(500).send('Fotoğraf yüklenirken bir hata oluştu.');
        }

        res.redirect('/myprofile');  // Fotoğraf yüklendikten sonra profil sayfasına yönlendir
    });
});

// Profil güncelleme
router.post('/update-profile', (req, res) => {
    const userId = req.session.userId;  // Oturumdaki kullanıcı ID'sini al
    const { name, surname, telefonno, adres } = req.body;  // Formdan gelen verileri al

    const query = `
        UPDATE users 
        SET name = ?, surname = ?, telefonno = ?, adres = ? 
        WHERE id = ?`;

    db.query(query, [name, surname, telefonno, adres, userId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Profil güncellenirken bir hata oluştu.');
        }

        res.redirect('/myprofile');  // Güncelleme başarılıysa profil sayfasına yönlendir
    });
});

// Sipariş iptal etme
router.post('/cancel-order', (req, res) => {
    const orderId = req.body.orderId;  // İptal edilecek siparişin ID'si

    // Siparişi güncelle ve ürünün `number` değerini artır
    const selectQuery = `
        SELECT p_id, table_name, satilan_adet
        FROM satis_tablosu
        WHERE id = ?
    `;
    
    db.query(selectQuery, [orderId], (err, result) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Sipariş iptali sırasında bir hata oluştu.');
        }

        if (result.length > 0) {
            const { p_id, table_name, satilan_adet } = result[0];

            // `number` değerini artır ve gerekirse ürünü sil
            const updateNumberQuery = `
                UPDATE ${table_name}
                SET number = number + ?
                WHERE id = ?
            `;
            db.query(updateNumberQuery, [satilan_adet, p_id], (err) => {
                if (err) {
                    console.error('Veritabanı hatası:', err);
                    return res.status(500).send('Ürün sayısı güncellenirken bir hata oluştu.');
                }

                // Siparişin durumunu güncelle
                const updateStatusQuery = 'UPDATE satis_tablosu SET durum = ? WHERE id = ?';
                db.query(updateStatusQuery, ['sipariş iptal edildi', orderId], (err) => {
                    if (err) {
                        console.error('Veritabanı hatası:', err);
                        return res.status(500).send('Sipariş durumu güncellenirken bir hata oluştu.');
                    }

                    res.redirect('/myprofile');  // Güncelleme sonrası profil sayfasına yönlendir
                });
            });
        } else {
            res.status(404).send('Sipariş bulunamadı.');
        }
    });
});

module.exports = router;
