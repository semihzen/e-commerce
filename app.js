const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const path = require('path');
const flash = require('connect-flash');
const signinRoutes = require('./signin'); // Giriş işlemleri
const signupRoutes = require('./server'); // Kayıt işlemleri
const productAddRoutes = require('./product-add'); // Ürün ekleme işlemleri
const productShowRoutes = require('./product-show');
const indexRoutes = require('./index');
const detailRouter = require('./detail');
const cartRouter = require('./cart');
const checkoutRouter = require('./checkout'); 



app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Kullanıcı bilgilerini middleware ile ekle
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    name: req.session.userName,
    surname: req.session.userSurname,
    email: req.session.userEmail // Email bilgisini de ekleyelim
  } : null;
  res.locals.message = req.flash('success');
  next();
});

// Kimlik doğrulama middleware'i
function authMiddleware(req, res, next) {
  if (req.session.userEmail && req.session.userEmail === 'admin@admin.com') {
    return next();
  } else {
    return res.redirect('/404');
  }
}



// Routes
app.use('/', signupRoutes); // Kayıt işlemleri
app.use('/', signinRoutes); // Giriş işlemleri
app.use('/', productAddRoutes);// Ürün ekleme işlemleri
app.use('/', productShowRoutes); 
app.use('/', indexRoutes); 
app.use('/', detailRouter);
app.use('/', cartRouter);
app.use(checkoutRouter);
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/cart", (req, res) => {
  res.render("cart");
});

app.get("/checkout", (req, res) => {
  res.render("checkout");
});

// Admin yetkisi gerektiren sayfalar
app.use("/products-table", authMiddleware, (req, res) => {
  res.render('product-table');

});
app.use("/admin", authMiddleware, (req, res) => {
  res.render("admin");
});
app.use("/form", authMiddleware, (req, res) => {
  res.render("forms-elements");
});
app.use("/salestable", authMiddleware, (req, res) => {
  res.render("tables-data");
});
app.use("/admin-profile", authMiddleware, (req, res) => {
  res.render("users-profile");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/edit", (req, res) => {
  res.render("edit-product-form");
});

app.get("/login-signup", (req, res) => {
  res.render("login-signup");
});

app.get("/shop", (req, res) => {
  res.render("shop");
});

// app.get("/detail", (req, res) => {
//   res.render("detail");
// });

app.use((req, res) => {
  res.status(404).render("404", { title: "SAYFA BULUNAMADI" });
});

app.listen(3000, () => {
  console.log("Başarıyla çalıştı");
});