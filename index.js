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

// Ürün sayısını al ve index.ejs dosyasına gönder
router.get('/', (req, res) => {
  const sqlMaleTshirt = "SELECT COUNT(*) AS count FROM tshirt WHERE gender IN ('Erkek', 'Unisex')";
  const sqlFemaleTshirt = "SELECT COUNT(*) AS count FROM tshirt WHERE gender IN ('Kadın', 'Unisex')";
  const sqlShort = "SELECT COUNT(*) AS count FROM short";
  const sqlSweatshirt = "SELECT COUNT(*) AS count FROM sweatshirt";
  const sqlShoes = "SELECT COUNT(*) AS count FROM shoes";
  const sqlEsofman = "SELECT COUNT(*) AS count FROM esofman";

  db.query(sqlMaleTshirt, (err, maleTshirtResult) => {
    if (err) throw err;
    const maleTshirtCount = maleTshirtResult[0].count;

    db.query(sqlFemaleTshirt, (err, femaleTshirtResult) => {
      if (err) throw err;
      const femaleTshirtCount = femaleTshirtResult[0].count;

      db.query(sqlShort, (err, shortResult) => {
        if (err) throw err;
        const shortCount = shortResult[0].count;

        db.query(sqlSweatshirt, (err, sweatshirtResult) => {
          if (err) throw err;
          const sweatshirtCount = sweatshirtResult[0].count;

          db.query(sqlShoes, (err, shoesResult) => {
            if (err) throw err;
            const shoesCount = shoesResult[0].count;

            db.query(sqlEsofman, (err, esofmanResult) => {
              if (err) throw err;
              const esofmanCount = esofmanResult[0].count;

              res.render('index', {
                maleTshirtCount: maleTshirtCount,
                femaleTshirtCount: femaleTshirtCount,
                shortCount: shortCount,
                sweatshirtCount: sweatshirtCount,
                shoesCount: shoesCount,
                esofmanCount: esofmanCount
              });
            });
          });
        });
      });
    });
  });
});

router.get('/shop', (req, res) => {
  let table = '';
  let genderFilter = '';
  let priceFilter = '';
  let colorFilter = '';

  // URL parametresine göre tablo belirleyin
  switch (req.query.t) {
      case 'erkek-tshirt':
          table = 'tshirt';
          genderFilter = "gender IN ('Erkek', 'Unisex')";
          break;
      case 'kadin-tshirt':
          table = 'tshirt';
          genderFilter = "gender IN ('Kadın', 'Unisex')";
          break;
      case 'short':
          table = 'short';
          break;
      case 'esofman':
          table = 'esofman';
          break;
      case 'sweatshirt':
          table = 'sweatshirt';
          break;
      case 'spor-ayakkabi':
          table = 'shoes';
          break;
      default:
          table = 'tshirt'; // Varsayılan tablo
          genderFilter = "gender IN ('Erkek', 'Unisex')";
          break;
  }

  // Fiyat filtresini kontrol et
  if (req.query.price) {
    const priceValues = Array.isArray(req.query.price) ? req.query.price : [req.query.price];
    const priceConditions = priceValues.map(priceRange => {
      if (priceRange === 'all') return null;
      const [min, max] = priceRange.split('-');
      return `(price BETWEEN ${min} AND ${max})`;
    }).filter(condition => condition !== null);
    priceFilter = priceConditions.join(' OR ');
  }

  // Renk filtresini kontrol et
  if (req.query.color) {
    const colorValues = Array.isArray(req.query.color) ? req.query.color : [req.query.color];
    const colorMapping = {
      'black': 'Siyah',
      'white': 'Beyaz',
      'other': 'Diğer renkler'
    };
    const colorConditions = colorValues.map(color => {
      if (color === 'all') return null;
      return `color = '${colorMapping[color]}'`;
    }).filter(condition => condition !== null);
    colorFilter = colorConditions.join(' OR ');
  }

  // SQL sorgusunu oluştur
  let sql = `SELECT id, product_name, price, photograph FROM ${table}`;
  const filters = [genderFilter, priceFilter, colorFilter].filter(Boolean).join(' AND ');
  if (filters.length > 0) {
    sql += ` WHERE ${filters}`;
  }

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Fotoğrafları base64 formatına dönüştür
    results.forEach(product => {
      if (product.photograph) {
        product.photograph = Buffer.from(product.photograph).toString('base64');
      }
    });

    res.render('shop', { products: results, table });
  });
});

module.exports = router;
