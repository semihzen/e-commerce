const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const session = require('express-session');
const router = express.Router();

// Veritabanı bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'e-commerce'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Veritabanına bağlandı');
});

// Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true
}));
router.use(flash());

// Kayıt sayfası için GET isteğini işle
router.get('/signup', (req, res) => {
  res.render('login-signup', {
    message: req.flash('message') // Flash mesajları gönder
  });
});

// Kayıt formu için POST isteğini işle
router.post('/signup', (req, res) => {
  const { email, password, name, surname } = req.body;

  if (!email || !password || !name || !surname) {
    req.flash('message', 'Email, şifre, ad ve soyad gereklidir');
    return res.redirect('/signup');
  }

  // Şifreyi hashle
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      req.flash('message', 'Şifre hashleme hatası');
      return res.redirect('/signup');
    }

    const query = 'INSERT INTO users (email, password, name, surname) VALUES (?, ?, ?, ?)';
    db.query(query, [email, hashedPassword, name, surname], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          req.flash('message', 'Bu email zaten kayıtlı');
          return res.redirect('/signup');
        }
        req.flash('message', 'Veritabanına kaydedilirken hata oluştu');
        return res.redirect('/signup');
      }
      req.flash('message', 'Kayıt başarılı, giriş yapabilirsiniz');
      res.redirect('/signup');
    });
  });
});



module.exports = router;
