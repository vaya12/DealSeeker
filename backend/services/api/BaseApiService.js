const axios = require('axios');

class BaseApiService {
    constructor(apiKey, apiUrl) {
        this.client = axios.create({
            baseURL: apiUrl,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
    }

    async getProducts() {
        try {
            const response = await this.client.get('/products');
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getProduct(id) {
        try {
            const response = await this.client.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    throw new Error('Unauthorized: Invalid API key');
                case 429:
                    throw new Error('Rate limit exceeded');
                case 500:
                    throw new Error('Internal server error');
                default:
                    throw new Error(`API Error: ${error.message}`);
            }
        } else if (error.request) {
            throw new Error('No response from API');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
}

module.exports = BaseApiService; 