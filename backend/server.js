const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/product');


const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/api', productRoutes);
app.use('/product_pictures', express.static(path.join(__dirname, 'product_pictures')));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DealSeeker API' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});