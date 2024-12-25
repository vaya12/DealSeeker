const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3001;

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'DealSeeker',
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 