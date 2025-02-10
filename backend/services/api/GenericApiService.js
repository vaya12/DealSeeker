const BaseApiService = require('./BaseApiService');
const dataMapper = require('../mappers/DataMapper');

class GenericApiService extends BaseApiService {
    constructor(apiKey, apiUrl) {
        super(apiKey, apiUrl);
        this.dataMapper = dataMapper;
    }

    async getProducts() {
        try {
            const response = await this.axios.get('/products');
            return response.data.map(this.transformProduct);
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProduct(productId) {
        try {
            const response = await this.axios.get(`/products/${productId}`);
            return this.transformProduct(response.data);
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            throw error;
        }
    }

    async getStock(productId) {
        try {
            const response = await this.axios.get(`/products/${productId}/stock`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching stock for ${productId}:`, error);
            throw error;
        }
    }

    async transformProduct(apiProduct) {
        return {
            name: apiProduct.name || apiProduct.title,
            description: apiProduct.description,
            brand: apiProduct.brand,
            category_id: await this.dataMapper.mapCategory(apiProduct.category),
            image: this.extractImageUrl(apiProduct),
            prices: await this.extractPrices(apiProduct)
        };
    }

    extractImageUrl(apiProduct) {
        if (apiProduct.image) return apiProduct.image;
        if (apiProduct.images?.[0]) return apiProduct.images[0];
        if (apiProduct.imageUrl) return apiProduct.imageUrl;
        return null;
    }

    async extractPrices(apiProduct) {
        const variants = apiProduct.variants || [apiProduct];
        const prices = [];
        
        for (const variant of variants) {
            prices.push({
                size_id: await this.dataMapper.mapSize(variant.size),
                color_id: await this.dataMapper.mapColor(variant.color),
                current_price: this.extractPrice(variant, 'current'),
                original_price: this.extractPrice(variant, 'original'),
                stock: this.determineStockStatus(variant)
            });
        }
        
        return prices;
    }

    extractPrice(variant, type) {
        if (variant.price?.[type]) return variant.price[type];
        if (type === 'current' && variant.price) return variant.price;
        if (type === 'current' && variant.currentPrice) return variant.currentPrice;
        if (type === 'original' && variant.originalPrice) return variant.originalPrice;
        return type === 'current' ? 0 : null;
    }

    determineStockStatus(variant) {
        if (variant.stock === 'in_stock') return 'in_stock';
        if (variant.stock === 'out_of_stock') return 'out_of_stock';
        if (typeof variant.stock === 'number') return variant.stock > 0 ? 'in_stock' : 'out_of_stock';
        if (variant.inStock) return 'in_stock';
        return 'out_of_stock';
    }
}

module.exports = GenericApiService; 