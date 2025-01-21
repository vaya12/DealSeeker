const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dealseeker'
};

async function createConnection() {
    return await mysql.createConnection(dbConfig);
}

module.exports = { createConnection };