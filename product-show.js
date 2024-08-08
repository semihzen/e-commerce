const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// MySQL bağlantısı
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'e-commerce'
});

connection.connect(error => {
  if (error) {
    console.error('Database connection failed:', error.stack);
    return;
  }
  console.log('Connected to database.');
});

// Ürün tablosundan verileri çek ve göster
router.get('/products-table', (req, res) => {
  const queries = {
    tshirtQuery: 'SELECT * FROM tshirt ORDER BY id ASC',
    esofmanQuery: 'SELECT * FROM esofman ORDER BY id ASC',
    sweatshirtQuery: 'SELECT * FROM sweatshirt ORDER BY id ASC',
    shortQuery: 'SELECT * FROM short ORDER BY id ASC',
    shoesQuery: 'SELECT * FROM shoes ORDER BY id ASC'
  };

  const queryPromises = Object.values(queries).map(query => {
    return new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  });

  Promise.all(queryPromises)
    .then(results => {
      const [tshirtResults, esofmanResults, sweatshirtResults, shortResults, shoesResults] = results;
      res.render('product-table', {
        tshirts: tshirtResults,
        products: esofmanResults,
        sweatshirts: sweatshirtResults,
        shorts: shortResults,
        shoes: shoesResults
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).send('An error occurred');
    });
});

// Ürünü düzenleme formu
router.get('/edit-product-form/:id', (req, res) => {
  const productId = req.params.id;
  const table = req.query.table;

  const query = `SELECT * FROM ${mysql.escapeId(table)} WHERE id = ?`;
  connection.query(query, [productId], (error, results) => {
    if (error) {
      console.error('Error fetching product:', error);
      return res.status(500).send('An error occurred');
    }
    if (results.length === 0) {
      return res.status(404).send('Product not found');
    }
    res.render('edit-product-form', { product: results[0], table: table });
  });
});

router.post('/edit-product/:id', (req, res) => {
  const productId = req.params.id;
  const table = req.body.table;

  const { product_name, product_explain, price, color, number, form, size, paca, gender, marka, kapuson } = req.body;

  // Mevcut ürünü al
  const checkQuery = `SELECT * FROM ${mysql.escapeId(table)} WHERE id = ?`;
  connection.query(checkQuery, [productId], (checkError, results) => {
    if (checkError) {
      console.error('Error fetching product:', checkError);
      return res.status(500).json({ success: false, message: 'An error occurred' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Sütunları kontrol et
    const checkColumnsQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = ? 
        AND COLUMN_NAME IN ('form', 'paca', 'marka', 'kapuson')
    `;
    connection.query(checkColumnsQuery, [table], (columnError, columns) => {
      if (columnError) {
        console.error('Error checking columns:', columnError);
        return res.status(500).json({ success: false, message: 'An error occurred' });
      }

      const columnNames = columns.map(col => col.COLUMN_NAME);

      // Eşleşen sütunları kullanarak güncelleme sorgusunu oluştur
      let updateQuery = `
        UPDATE ${mysql.escapeId(table)}
        SET product_name = ?, product_explain = ?, price = ?, color = ?, number = ?, size = ?, gender = ?
      `;
      let updateValues = [
        product_name, 
        product_explain, 
        price, 
        color, 
        number, 
        size, 
        gender
      ];

      if (columnNames.includes('form')) {
        updateQuery += ', form = ?';
        updateValues.push(form);
      }
      if (columnNames.includes('paca')) {
        updateQuery += ', paca = ?';
        updateValues.push(paca);
      }
      if (columnNames.includes('marka')) {
        updateQuery += ', marka = ?';
        updateValues.push(marka);
      }
      if (columnNames.includes('kapuson')) {
        updateQuery += ', kapuson = ?';
        updateValues.push(kapuson);
      }

      updateQuery += ' WHERE id = ?';
      updateValues.push(productId);

      connection.query(updateQuery, updateValues, (updateError) => {
        if (updateError) {
          console.error('Error updating product:', updateError);
          return res.status(500).json({ success: false, message: 'An error occurred' });
        }
        res.json({ success: true, message: 'Product updated successfully' });
      });
    });
  });
});

// Ürünü silme
router.delete('/delete-product/:id', (req, res) => {
  const productId = req.params.id;
  const table = req.body.table;

  const query = `DELETE FROM ${mysql.escapeId(table)} WHERE id = ?`;
  connection.query(query, [productId], (error) => {
    if (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ success: false, message: 'An error occurred' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  });
});

module.exports = router;
