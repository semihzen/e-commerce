const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

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

// Giriş sayfası için GET isteğini işle
router.get('/login-signup', (req, res) => {
  res.render('login-signup', {
    message: req.flash('error')
  });
});

// Giriş formu için POST isteğini işle
router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Email ve şifre gereklidir');
    return res.redirect('/login-signup');
  }

  const query = 'SELECT id, email, password, name, surname FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      req.flash('error', 'Veritabanı hatası');
      return res.redirect('/login-signup');
    }

    if (results.length === 0) {
      req.flash('error', 'Geçersiz email veya şifre');
      return res.redirect('/login-signup');
    }

    const user = results[0];

    // Şifreyi doğrula
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        req.flash('error', 'Şifre doğrulama hatası');
        return res.redirect('/login-signup');
      }

      if (!isMatch) {
        req.flash('error', 'Geçersiz email veya şifre');
        return res.redirect('/login-signup');
      }

      // Oturum başlat
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.userSurname = user.surname;
      req.session.userEmail = user.email; // Email bilgisini de ekleyelim
      res.redirect('/'); // Giriş başarılıysa ana sayfaya yönlendir
    });
  });
});

// Çıkış işlemi için GET isteğini işle
router.get('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Oturum kapatma hatası:', err);
      return res.redirect('/');
    }
    
    res.redirect('/');
  });
});

module.exports = router;
