const { createConnection } = require('../../database/dbConfig');

class DataMapper {
    constructor() {
        this.categoryCache = new Map();
        this.sizeCache = new Map();
        this.colorCache = new Map();
    }

    async init() {
        await this.loadCategories();
        await this.loadSizes();
        await this.loadColors();
    }

    async loadCategories() {
        const connection = await createConnection();
        try {
            const [categories] = await connection.execute('SELECT id, name FROM categories');
            categories.forEach(category => {
                this.categoryCache.set(category.name.toLowerCase(), category.id);
            });
        } finally {
            await connection.end();
        }
    }

    async loadSizes() {
        const connection = await createConnection();
        try {
            const [sizes] = await connection.execute('SELECT id, name FROM sizes');
            sizes.forEach(size => {
                this.sizeCache.set(size.name.toLowerCase(), size.id);
            });
        } finally {
            await connection.end();
        }
    }

    async loadColors() {
        const connection = await createConnection();
        try {
            const [colors] = await connection.execute('SELECT id, name FROM colors');
            colors.forEach(color => {
                this.colorCache.set(color.name.toLowerCase(), color.id);
            });
        } finally {
            await connection.end();
        }
    }

    async mapCategory(categoryName) {
        if (!categoryName) return null;
        
        const normalizedName = categoryName.toLowerCase();
        
        if (this.categoryCache.has(normalizedName)) {
            return this.categoryCache.get(normalizedName);
        }

        const connection = await createConnection();
        try {
            const [result] = await connection.execute(
                'INSERT IGNORE INTO categories (name) VALUES (?)',
                [categoryName]
            );
            
            const categoryId = result.insertId || 
                (await connection.execute('SELECT id FROM categories WHERE name = ?', [categoryName]))[0][0].id;
            
            this.categoryCache.set(normalizedName, categoryId);
            return categoryId;
        } finally {
            await connection.end();
        }
    }

    async mapSize(sizeName) {
        if (!sizeName) return null;
        
        const normalizedName = sizeName.toLowerCase();
        
        if (this.sizeCache.has(normalizedName)) {
            return this.sizeCache.get(normalizedName);
        }

        const connection = await createConnection();
        try {
            const [result] = await connection.execute(
                'INSERT IGNORE INTO sizes (name) VALUES (?)',
                [sizeName]
            );
            
            const sizeId = result.insertId || 
                (await connection.execute('SELECT id FROM sizes WHERE name = ?', [sizeName]))[0][0].id;
            
            this.sizeCache.set(normalizedName, sizeId);
            return sizeId;
        } finally {
            await connection.end();
        }
    }

    async mapColor(colorName) {
        if (!colorName) return null;
        
        const normalizedName = colorName.toLowerCase();
        
        if (this.colorCache.has(normalizedName)) {
            return this.colorCache.get(normalizedName);
        }

        const connection = await createConnection();
        try {
            const [result] = await connection.execute(
                'INSERT IGNORE INTO colors (name) VALUES (?)',
                [colorName]
            );
            
            const colorId = result.insertId || 
                (await connection.execute('SELECT id FROM colors WHERE name = ?', [colorName]))[0][0].id;
            
            this.colorCache.set(normalizedName, colorId);
            return colorId;
        } finally {
            await connection.end();
        }
    }
}

module.exports = new DataMapper(); 