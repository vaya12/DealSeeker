const axios = require('axios');
const RetryHandler = require('../../utils/RetryHandler');

class BaseApiService {
    constructor(apiKey, apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.axios = axios.create({
            baseURL: apiUrl,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        this.axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            throw new Error('Unauthorized: Invalid API key');
                        case 403:
                            throw new Error('Forbidden: Access denied');
                        case 404:
                            throw new Error('Not found: Resource does not exist');
                        case 429:
                            throw new Error('Rate limit exceeded');
                        case 500:
                            throw new Error('Internal server error');
                        default:
                            throw new Error(`API error: ${error.response.status}`);
                    }
                } else if (error.request) {
                    throw new Error('No response from API');
                } else {
                    throw new Error('Request failed: ' + error.message);
                }
            }
        );
    }

    async getProducts() {
        return RetryHandler.withRetry(async () => {
            const response = await this.axios.get('/products');
            return this.transformProducts(response.data);
        });
    }

    async getProduct(productId) {
        return RetryHandler.withRetry(async () => {
            const response = await this.axios.get(`/products/${productId}`);
            return this.transformProduct(response.data);
        });
    }

    async getStock(productId) {
        return RetryHandler.withRetry(async () => {
            const response = await this.axios.get(`/products/${productId}/stock`);
            return response.data;
        });
    }

    transformProducts(data) {
        if (Array.isArray(data)) {
            return data.map(product => this.transformProduct(product));
        }
        return [];
    }

    transformProduct(apiProduct) {
        throw new Error('transformProduct method must be implemented');
    }

    handleApiError(error, context) {
        console.error(`Error in ${context}:`, error);
        throw error;
    }
}

module.exports = BaseApiService;