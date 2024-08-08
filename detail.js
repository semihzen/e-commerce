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

// Ürün detaylarını gösteren rota
router.get('/detail', (req, res) => {
  const id = req.query.id;
  const table = req.query.table;
  const message = req.flash('message');

  if (!id || !table) {
    return res.status(404).render('404', { title: 'Ürün Bulunamadı' });
  }

  const sql = `SELECT * FROM ${table} WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).render('404', { title: 'Hata' });
    }

    if (result.length === 0) {
      return res.status(404).render('404', { title: 'Ürün Bulunamadı' });
    }

    const product = result[0];
    if (product.photograph) {
      product.photograph = Buffer.from(product.photograph).toString('base64');
    }

    const relatedProductsSql = `SELECT * FROM ${table} WHERE product_name = ? AND color != ?`;
    db.query(relatedProductsSql, [product.product_name, product.color], (err, relatedProducts) => {
      if (err) {
        console.error('SQL Error:', err);
        return res.status(500).render('404', { title: 'Hata' });
      }

      relatedProducts.forEach(relatedProduct => {
        if (relatedProduct.photograph) {
          relatedProduct.photograph = Buffer.from(relatedProduct.photograph).toString('base64');
        }
      });

      const sizesSql = `SELECT size FROM ${table} WHERE product_name = ? AND color = ? AND price = ?`;
      db.query(sizesSql, [product.product_name, product.color, product.price], (err, sizesResult) => {
        if (err) {
          console.error('SQL Error:', err);
          return res.status(500).render('404', { title: 'Hata' });
        }

        const availableSizes = sizesResult.map(row => row.size);

        res.render('detail', { product, relatedProducts, table, availableSizes, message });
      });
    });
  });
});

// Sepete ürün ekleme işlemi
router.post('/add-to-cart', (req, res) => {
  const { productId, table, size, quantity } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    req.flash('error', 'Giriş Yapmanız Gerekmektedir');
    return res.redirect('/login-signup');
  }

  if (!productId || !table || !size || !quantity) {
    req.flash('message', 'Beden ve miktar seçiniz');
    return res.redirect(`/detail?id=${productId}&table=${table}`);
  }

  // Stok kontrolü
  const checkStockSql = `SELECT number FROM ${table} WHERE product_name = (SELECT product_name FROM ${table} WHERE id = ?) AND size = ? AND color = (SELECT color FROM ${table} WHERE id = ?)`;
  db.query(checkStockSql, [productId, size, productId], (err, result) => {
    if (err) {
      console.error('SQL Error:', err);
      req.flash('message', 'Hata Oluştu');
      return res.redirect(`/detail?id=${productId}&table=${table}`);
    }

    if (result.length === 0) {
      req.flash('message', 'Ürün bulunamadı');
      return res.redirect(`/detail?id=${productId}&table=${table}`);
    }

    const availableQuantity = result[0].number;
    if (quantity > availableQuantity) {
      req.flash('message', 'Yeterli Stok Bulunmuyor');
      return res.redirect(`/detail?id=${productId}&table=${table}`);
    }

    // Sepette aynı ürünün olup olmadığını kontrol et
    const checkProductSql = `SELECT id FROM cart 
                             WHERE user_id = ? 
                             AND product_name = (SELECT product_name FROM ${table} WHERE id = ?) 
                             AND size = ? 
                             AND price = (SELECT price FROM ${table} WHERE id = ?) 
                             LIMIT 1`;

    db.query(checkProductSql, [userId, productId, size, productId], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        req.flash('message', 'Sepete Eklenirken Hata Oluştu');
        return res.redirect(`/detail?id=${productId}&table=${table}`);
      }

      if (results.length > 0) {
        // Aynı ürün zaten sepette
        req.flash('message', 'Bu ürün zaten sepetinizde mevcut');
        return res.redirect(`/detail?id=${productId}&table=${table}`);
      }

      // Aynı ürün sepette yoksa, ürünü sepete ekle
      const addToCartSql = `INSERT INTO cart (user_id, siparis_adeti, price, product_name, size, photograph, table_name ,p_id)
                            SELECT ?, ?, price, product_name, ?, photograph, ? ,${productId}
                            FROM ${table} 
                            WHERE id = ?`;

      db.query(addToCartSql, [userId, quantity, size, table, productId], (err) => {
        if (err) {
          console.error('SQL Error:', err);
          req.flash('message', 'Sepete Eklenirken Hata Oluştu');
          return res.redirect(`/detail?id=${productId}&table=${table}`);
        } else {
          req.flash('message', 'Ürün başarıyla sepete eklendi');
          return res.redirect(`/detail?id=${productId}&table=${table}`);
        }
      });
    });
  });
});

module.exports = router;
