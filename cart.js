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

// Sepeti gösterme
router.get('/cart', (req, res) => {
  // Oturum kontrolü
  if (!req.session.userId) {
    return res.redirect('/login-signup'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  }

  const userId = req.session.userId; // Oturum değişkeni ismini doğru kullanın
const sql = 'SELECT id, user_id, siparis_adeti, price, product_name, photograph, size FROM cart WHERE user_id = ?';

db.query(sql, [userId], (err, results) => {
  if (err) {
    console.error('Database query error:', err);
    return res.status(500).send('An error occurred'); // Hata mesajı döndür
  }

  // Fotograf verisini base64 formatına dönüştür
  results.forEach(item => {
    if (item.photograph) {
      item.photograph = Buffer.from(item.photograph).toString('base64');
    }
  });

  res.render('cart', { items: results });
});
});
router.post('/cart/update/:id', (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).send('Quantity must be at least 1');
  }

  const sql = 'UPDATE cart SET siparis_adeti = ? WHERE id = ? AND user_id = ?';
  const userId = req.session.userId; // Oturum değişkeni ismini doğru kullanın

  db.query(sql, [quantity, productId, userId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('An error occurred'); // Hata mesajı döndür
    }
    res.json({ success: true }); // Başarı durumu döndür
  });
});
router.get('/cart/stock/:id', (req, res) => {
  const cartId = req.params.id;

  // Sepetteki ürünün p_id ve table_name değerlerini al
  const getCartProductSql = 'SELECT p_id, table_name FROM cart WHERE id = ?';
  db.query(getCartProductSql, [cartId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('An error occurred');
    }

    const { p_id, table_name } = results[0] || {};

    if (!p_id || !table_name) {
      return res.status(404).send('Product not found in cart');
    }

    // p_id ve table_name kullanarak stok bilgisini al
    const getProductStockSql = `SELECT number FROM ${table_name} WHERE id = ?`;
    db.query(getProductStockSql, [p_id], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('An error occurred');
      }

      const stockQuantity = results[0]?.number;

      if (stockQuantity === undefined) {
        return res.status(404).send('Product stock information not found');
      }

      res.json({ stockQuantity });
    });
  });
});
// Sepetten ürün silme
router.post('/cart/remove/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM cart WHERE id = ?';
  
  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('An error occurred'); // Hata mesajı döndür
    }
    res.redirect('/cart'); // Sepetten ürün silindikten sonra sepete geri yönlendir
  });
});

module.exports = router;
