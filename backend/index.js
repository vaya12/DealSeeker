const express = require('express');
const productsRouter = require('./routes/product');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', productsRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
