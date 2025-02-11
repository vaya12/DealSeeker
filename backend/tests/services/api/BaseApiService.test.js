const BaseApiService = require('../../../services/api/BaseApiService');
const RetryHandler = require('../../../utils/RetryHandler');
const axios = require('axios');

jest.mock('axios');
jest.mock('../../../utils/RetryHandler');

describe('BaseApiService', () => {
    let service;
    const mockApiKey = 'test_api_key';
    const mockApiUrl = 'https://api.test.com';

    beforeEach(() => {
        service = new BaseApiService(mockApiKey, mockApiUrl);
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create axios instance with correct config', () => {
            expect(axios.create).toHaveBeenCalledWith({
                baseURL: mockApiUrl,
                headers: {
                    'Authorization': `Bearer ${mockApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
        });
    });

    describe('getProducts', () => {
        it('should call RetryHandler with correct function', async () => {
            const mockData = [{ id: 1, name: 'Test Product' }];
            const mockResponse = { data: mockData };
            
            axios.get.mockResolvedValueOnce(mockResponse);
            RetryHandler.withRetry.mockImplementation(fn => fn());

            await service.getProducts();

            expect(RetryHandler.withRetry).toHaveBeenCalled();
            expect(axios.get).toHaveBeenCalledWith('/products');
        });

        it('should handle API errors correctly', async () => {
            const error = new Error('API Error');
            error.response = { status: 500 };
            
            axios.get.mockRejectedValueOnce(error);
            RetryHandler.withRetry.mockImplementation(fn => fn());

            await expect(service.getProducts()).rejects.toThrow('Internal server error');
        });
    });

    describe('getProduct', () => {
        it('should fetch single product correctly', async () => {
            const mockData = { id: 1, name: 'Test Product' };
            const mockResponse = { data: mockData };
            
            axios.get.mockResolvedValueOnce(mockResponse);
            RetryHandler.withRetry.mockImplementation(fn => fn());

            await service.getProduct(1);

            expect(RetryHandler.withRetry).toHaveBeenCalled();
            expect(axios.get).toHaveBeenCalledWith('/products/1');
        });
    });

    describe('error handling', () => {
        it('should handle 401 errors', async () => {
            const error = new Error('Unauthorized');
            error.response = { status: 401 };
            
            axios.get.mockRejectedValueOnce(error);
            RetryHandler.withRetry.mockImplementation(fn => fn());

            await expect(service.getProducts()).rejects.toThrow('Unauthorized: Invalid API key');
        });

        it('should handle network errors', async () => {
            const error = new Error('Network Error');
            error.request = {};
            
            axios.get.mockRejectedValueOnce(error);
            RetryHandler.withRetry.mockImplementation(fn => fn());

            await expect(service.getProducts()).rejects.toThrow('No response from API');
        });

        it('should handle rate limiting', async () => {
            const error = new Error('Rate Limited');
            error.response = { status: 429 };
            
            axios.get.mockRejectedValueOnce(error);
            RetryHandler.withRetry.mockImplementation(fn => fn());

            await expect(service.getProducts()).rejects.toThrow('Rate limit exceeded');
        });
    });
}); 