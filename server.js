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

// Şifre değiştirme sayfası için GET isteğini işle
router.get('/change-password', (req, res) => {
  res.render('users-profile', {
    message: req.flash('message') // Flash mesajları gönder
  });
});

// Şifre değiştirme formu için POST isteğini işle
router.post('/change-password', (req, res) => {
  const userId = req.session.userId; // Oturumda tanımlanan kullanıcı ID'si
  const { password, newpassword, renewpassword } = req.body;

  if (!userId) {
    req.flash('message', 'Giriş yapmanız gerekiyor');
    return res.redirect('/login-signup'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  }

  if (!password || !newpassword || !renewpassword) {
    req.flash('message', 'Mevcut şifre, yeni şifre ve yeni şifrenizi doğrulamanız gereklidir');
    return res.redirect('/change-password');
  }

  if (newpassword !== renewpassword) {
    req.flash('message', 'Yeni şifreler eşleşmiyor');
    return res.redirect('/change-password');
  }

  if (newpassword.length < 6) {
    req.flash('message', 'Yeni şifre en az 6 karakter uzunluğunda olmalıdır');
    return res.redirect('/change-password');
  }

  // Kullanıcının mevcut şifresini doğrula
  const query = 'SELECT password FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      req.flash('message', 'Şifre doğrulama hatası');
      return res.redirect('/change-password');
    }

    if (results.length === 0) {
      req.flash('message', 'Kullanıcı bulunamadı');
      return res.redirect('/change-password');
    }

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        console.error(err);
        req.flash('message', 'Şifre karşılaştırma hatası');
        return res.redirect('/change-password');
      }

      if (!isMatch) {
        req.flash('message', 'Mevcut şifre yanlış');
        return res.redirect('/change-password');
      }

      // Yeni şifreyi hashle ve veritabanına güncelle
      bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error(err);
          req.flash('message', 'Yeni şifre hashleme hatası');
          return res.redirect('/change-password');
        }

        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
        db.query(updateQuery, [hashedPassword, userId], (err) => {
          if (err) {
            console.error(err);
            req.flash('message', 'Şifre güncellenirken hata oluştu');
            return res.redirect('/change-password');
          }

          req.flash('message', 'Şifre başarıyla değiştirildi');
          res.redirect('/change-password');
        });
      });
    });
  });
});

module.exports = router;
