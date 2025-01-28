const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', productRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DealSeeker API' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
