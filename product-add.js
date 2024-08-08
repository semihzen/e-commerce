const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'e-commerce'
});

connection.connect();

router.post('/product-add', upload.single('photograph'), (req, res) => {
  const { product_name, product_explain, price, number, form, gender, color, size } = req.body;
  let photograph = null;

  if (req.file) {
    photograph = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);  // Dosya sisteminden geçici dosyayı sil
  }

  const checkQuery = 'SELECT * FROM tshirt WHERE product_name = ? AND product_explain = ? AND price = ? AND form = ? AND gender = ? AND color = ? AND size = ?';
  connection.query(checkQuery, [product_name, product_explain, price, form, gender, color, size], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking existing data: ', checkError);
      req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      return res.redirect('/form');
    }

    if (checkResults.length > 0) {
      // Eğer mevcut veriler varsa, number değerini güncelle
      const existingNumber = checkResults[0].number;
      const newNumber = existingNumber + parseInt(number, 10);

      const updateQuery = 'UPDATE tshirt SET number = ? WHERE product_name = ? AND product_explain = ? AND price = ? AND form = ? AND gender = ? AND color = ? AND size = ?';
      connection.query(updateQuery, [newNumber, product_name, product_explain, price, form, gender, color, size], (updateError) => {
        if (updateError) {
          console.error('Error updating data: ', updateError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün güncellendi!');
        res.redirect('/form');
      });
    } else {
      // Eğer mevcut veri yoksa, yeni veri ekle
      const insertQuery = 'INSERT INTO tshirt (product_name, product_explain, price, number, photograph, form, gender, color, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertQuery, [product_name, product_explain, price, number, photograph, form, gender, color, size], (insertError) => {
        if (insertError) {
          console.error('Error inserting data into tshirt: ', insertError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün başarıyla eklendi!');
        res.redirect('/form');
      });
    }
  });
}); 




router.post('/save-esofman', upload.single('photograph'), (req, res) => {
  const { product_name, product_explain, price, number, form, gender, color, size, paca } = req.body;
  let photograph = null;

  if (req.file) {
    photograph = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);  // Dosya sisteminden geçici dosyayı sil
  }

  const checkQuery = 'SELECT * FROM esofman WHERE product_name = ? AND product_explain = ? AND price = ? AND form = ? AND gender = ? AND color = ? AND size = ? AND paca = ?';
  connection.query(checkQuery, [product_name, product_explain, price, form, gender, color, size, paca], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking existing data: ', checkError);
      req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      return res.redirect('/form');
    }

    if (checkResults.length > 0) {
      // Eğer mevcut veriler varsa, number değerini güncelle
      const existingNumber = checkResults[0].number;
      const newNumber = existingNumber + parseInt(number, 10);

      const updateQuery = 'UPDATE esofman SET number = ? WHERE product_name = ? AND product_explain = ? AND price = ? AND form = ? AND gender = ? AND color = ? AND size = ? AND paca = ?';
      connection.query(updateQuery, [newNumber, product_name, product_explain, price, form, gender, color, size, paca], (updateError) => {
        if (updateError) {
          console.error('Error updating data: ', updateError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün güncellendi!');
        res.redirect('/form');
      });
    } else {
      // Eğer mevcut veri yoksa, yeni veri ekle
      const insertQuery = 'INSERT INTO esofman (product_name, product_explain, price, number, photograph, form, gender, color, size, paca) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertQuery, [product_name, product_explain, price, number, photograph, form, gender, color, size, paca], (insertError) => {
        if (insertError) {
          console.error('Error inserting data into esofman: ', insertError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün başarıyla eklendi!');
        res.redirect('/form');
      });
    }
  });
});








router.post('/save-sweatshirt', upload.single('photograph'), (req, res) => {
  const { product_name, product_explain, price, number, form, gender, color, size, kapuson } = req.body;
  let photograph = null;

  if (req.file) {
    photograph = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);  // Dosya sisteminden geçici dosyayı sil
  }

  const checkQuery = 'SELECT * FROM sweatshirt WHERE product_name = ? AND product_explain = ? AND price = ? AND kapuson = ? AND form = ? AND color = ? AND size = ? AND gender = ?';
  connection.query(checkQuery, [product_name, product_explain, price, kapuson, form, color, size, gender], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking existing data: ', checkError);
      req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      return res.redirect('/form');
    }

    if (checkResults.length > 0) {
      // Eğer mevcut veriler varsa, number değerini güncelle
      const existingNumber = checkResults[0].number;
      const newNumber = existingNumber + parseInt(number, 10);

      const updateQuery = 'UPDATE sweatshirt SET number = ? WHERE product_name = ? AND product_explain = ? AND price = ? AND kapuson = ? AND form = ? AND color = ? AND size = ? AND gender = ?';
      connection.query(updateQuery, [newNumber, product_name, product_explain, price, kapuson, form, color, size, gender], (updateError) => {
        if (updateError) {
          console.error('Error updating data: ', updateError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün güncellendi!');
        res.redirect('/form');
      });
    } else {
      // Eğer mevcut veri yoksa, yeni veri ekle
      const insertQuery = 'INSERT INTO sweatshirt (product_name, product_explain, price, number, photograph, kapuson, form, color, size, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertQuery, [product_name, product_explain, price, number, photograph, kapuson, form, color, size, gender], (insertError) => {
        if (insertError) {
          console.error('Error inserting data into sweatshirt: ', insertError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün başarıyla eklendi!');
        res.redirect('/form');
      });
    }
  });
});







router.post('/save-shoes', upload.single('photograph'), (req, res) => {
  const { product_name, product_explain, price, number, marka, gender, color, size } = req.body;
  let photograph = null;

  if (req.file) {
    photograph = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);  // Dosya sisteminden geçici dosyayı sil
  }

  const checkQuery = 'SELECT * FROM shoes WHERE product_name = ? AND product_explain = ? AND price = ? AND marka = ? AND gender = ? AND color = ? AND size = ?';
  connection.query(checkQuery, [product_name, product_explain, price, marka, gender, color, size], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking existing data: ', checkError);
      req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      return res.redirect('/form');
    }

    if (checkResults.length > 0) {
      // Eğer mevcut veriler varsa, number değerini güncelle
      const existingNumber = checkResults[0].number;
      const newNumber = existingNumber + parseInt(number, 10);

      const updateQuery = 'UPDATE shoes SET number = ? WHERE product_name = ? AND product_explain = ? AND price = ? AND marka = ? AND gender = ? AND color = ? AND size = ?';
      connection.query(updateQuery, [newNumber, product_name, product_explain, price, marka, gender, color, size], (updateError) => {
        if (updateError) {
          console.error('Error updating data: ', updateError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün güncellendi!');
        res.redirect('/form');
      });
    } else {
      // Eğer mevcut veri yoksa, yeni veri ekle
      const insertQuery = 'INSERT INTO shoes (product_name, product_explain, price, number, photograph, marka, gender, color, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertQuery, [product_name, product_explain, price, number, photograph, marka, gender, color, size], (insertError) => {
        if (insertError) {
          console.error('Error inserting data into shoes: ', insertError);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün başarıyla eklendi!');
        res.redirect('/form');
      });
    }
  });
});



router.post('/save-short', upload.single('photograph'), (req, res) => {
  const { product_name, product_explain, price, number, form, gender, color, size } = req.body;
  let photograph = null;

  if (req.file) {
    photograph = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);  // Geçici dosyayı sil
  }

  // Aynı verileri kontrol et
  const checkQuery = 'SELECT id, number FROM short WHERE product_name = ? AND product_explain = ? AND form = ? AND gender = ? AND color = ? AND size = ?';
  connection.query(checkQuery, [product_name, product_explain, form, gender, color, size], (err, results) => {
    if (err) {
      console.error('Error checking data: ', err);
      req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      return res.redirect('/form');
    }

    if (results.length > 0) {
      // Eğer veri varsa, number değerini güncelle
      const existingNumber = results[0].number;
      const newNumber = existingNumber + parseInt(number);

      const updateQuery = 'UPDATE short SET number = ? WHERE id = ?';
      connection.query(updateQuery, [newNumber, results[0].id], (error) => {
        if (error) {
          console.error('Error updating number: ', error);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün başarıyla güncellendi!');
        res.redirect('/form');
      });
    } else {
      // Eğer veri yoksa, yeni veri ekle
      const insertQuery = 'INSERT INTO short (product_name, product_explain, price, number, photograph, form, gender, color, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertQuery, [product_name, product_explain, price, number, photograph, form, gender, color, size], (error) => {
        if (error) {
          console.error('Error inserting data into short: ', error);
          req.flash('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
          return res.redirect('/form');
        }
        req.flash('success', 'Ürün başarıyla eklendi!');
        res.redirect('/form');
      });
    }
  });
});


module.exports = router;
