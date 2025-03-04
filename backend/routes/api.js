router.get('/colors', async (req, res) => {
    let connection;
    try {
        connection = await createConnection();
        const [colors] = await connection.execute('SELECT * FROM colors');
        res.json(colors);
    } catch (error) {
        console.error('Error fetching colors:', error);
        res.status(500).json({ error: 'Failed to fetch colors' });
    } finally {
        if (connection) await connection.end();
    }
});

router.get('/sizes', async (req, res) => {
    let connection;
    try {
        connection = await createConnection();
        const [sizes] = await connection.execute('SELECT * FROM sizes');
        res.json(sizes);
    } catch (error) {
        console.error('Error fetching sizes:', error);
        res.status(500).json({ error: 'Failed to fetch sizes' });
    } finally {
        if (connection) await connection.end();
    }
}); 