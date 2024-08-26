const express = require('express');
const router = express.Router();
const mysql = require('mysql');

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

router.get('/salestable', (req, res) => {
  const query = `
    SELECT 
      satis_tablosu.id, 
      satis_tablosu.user_id, 
      users.name, 
      users.surname, 
      users.adres,
      satis_tablosu.product_name, 
      satis_tablosu.satilan_adet, 
      satis_tablosu.p_id, 
      satis_tablosu.table_name, 
      satis_tablosu.toplam_fiyat, 
      satis_tablosu.price, 
      satis_tablosu.size, 
      satis_tablosu.photograph,
      satis_tablosu.satilan_gun,
      satis_tablosu.durum
    FROM 
      satis_tablosu
    JOIN 
      users ON satis_tablosu.user_id = users.id
    WHERE
      satis_tablosu.durum != 'sipariş iptal edildi';
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      return res.status(500).send('An error occurred during the database query.');
    }

    // Fotoğraf verisini base64 formatına dönüştür
    const data = results.map(item => {
      if (item.photograph) {
        item.photograph = `data:image/jpeg;base64,${item.photograph.toString('base64')}`;
      }
      return item;
    });

    res.render('tables-data', { data: data });
  });
});

// Admin paneli verileri çek ve göster
router.get('/admin', (req, res) => {
  const salesQuery = `
    SELECT 
      SUM(satilan_adet) AS totalSales, 
      SUM(toplam_fiyat) AS totalRevenue 
    FROM 
      satis_tablosu
    WHERE 
      durum != 'sipariş iptal edildi';
  `;

  const customersQuery = `
    SELECT COUNT(id) - 1 AS totalCustomers 
    FROM users;
  `;

  connection.query(salesQuery, (error, salesResults) => {
    if (error) {
      console.error('Error fetching sales data:', error);
      return res.status(500).send('An error occurred during the database query.');
    }

    connection.query(customersQuery, (error, customersResults) => {
      if (error) {
        console.error('Error fetching customers data:', error);
        return res.status(500).send('An error occurred during the database query.');
      }

      const detailedSalesQuery = `
        SELECT 
          u.name, 
          u.surname, 
          u.adres, 
          u.telefonno,
          s.product_name, 
          s.satilan_adet, 
          s.price, 
          s.toplam_fiyat, 
          s.durum ,
          s.id
        FROM 
          satis_tablosu s
        JOIN 
          users u ON s.user_id = u.id
      `;

      connection.query(detailedSalesQuery, (error, detailedSalesResults) => {
        if (error) {
          console.error('Error fetching detailed sales data:', error);
          return res.status(500).send('An error occurred during the database query.');
        }

        // Verileri admin.ejs dosyasına gönder
        res.render('admin', { 
          totalSales: salesResults[0].totalSales || 0, 
          totalRevenue: salesResults[0].totalRevenue || 0,
          totalCustomers: customersResults[0].totalCustomers || 0,
          results: detailedSalesResults // Detaylı satış bilgileri
        });
      });
    });
  });
});
router.post('/update-status', (req, res) => {
  const orderId = req.body.id; // Formdan gelen sipariş ID'si
  const newStatus = 'Kargoya Verildi'; // Durumun sabit olarak "Kargoya Verildi" olarak ayarlanması

  

  const updateQuery = `
    UPDATE satis_tablosu
    SET durum = ?
    WHERE id = ?
  `;

  connection.query(updateQuery, [newStatus, orderId], (error, results) => {
    if (error) {
      console.error('Error updating status:', error);
      return res.status(500).send('An error occurred while updating the status.');
    }
    
    // Güncelleme başarılı, sayfayı yenileyerek kullanıcıyı aynı sayfada tut
    res.redirect('back');
  });
});

module.exports = router;
