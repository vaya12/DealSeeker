const API_URL = 'http://localhost:3002/api';

export const productService = {
    getAllProducts: async () => {
        try {
            const response = await fetch('http://localhost:3002/api/products');

            // const response = await fetch(`${API_URL}/products`, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            // });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Raw data:', data);

            if (data.products) {
                data.products = data.products.map(product => ({
                    ...product,
                    id: product.id || Math.random().toString(36),
                    name: product.name || 'Unnamed product',
                    brand: product.brand || 'Unknown brand',
                    available_sizes: Array.isArray(product.available_sizes) 
                        ? product.available_sizes 
                        : [],
                    available_colors: Array.isArray(product.available_colors)
                        ? product.available_colors
                        : [],
                    prices: Array.isArray(product.prices) 
                        ? product.prices 
                        : [],
                    min_price: product.min_price || 0,
                    max_price: product.max_price || 0
                }));
            }

            console.log('Formatted data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    searchProducts: async (params) => {
        try {
            const response = await fetch(`${API_URL}/products/search?${new URLSearchParams(params)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    },

    getProductById: async (id) => {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    async getProducts(filters = {}) {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.products) {
                data.products = data.products.map(product => ({
                    ...product,
                    available_sizes: Array.isArray(product.available_sizes) 
                        ? product.available_sizes 
                        : (typeof product.available_sizes === 'string'
                            ? product.available_sizes.split(',')
                            : []),
                    available_colors: Array.isArray(product.available_colors)
                        ? product.available_colors
                        : (typeof product.available_colors === 'string'
                            ? product.available_colors.split(',')
                            : [])
                }));
            }
            
            return data;
        } catch (error) {
            console.error('Error in getProducts:', error);
            throw error;
        }
    }
}; 