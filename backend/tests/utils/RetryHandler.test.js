const RetryHandler = require('../../utils/RetryHandler');

describe('RetryHandler', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should execute operation successfully on first try', async () => {
        const operation = jest.fn().mockResolvedValue('success');
        
        const result = await RetryHandler.withRetry(operation);
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry failed operation', async () => {
        const operation = jest.fn()
            .mockRejectedValueOnce(new Error('First failure'))
            .mockResolvedValueOnce('success');
        
        const resultPromise = RetryHandler.withRetry(operation);
        
        jest.runAllTimers();
        
        const result = await resultPromise;
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Always fails'));
        
        const resultPromise = RetryHandler.withRetry(operation, 3);
        
        jest.runAllTimers();
        
        await expect(resultPromise).rejects.toThrow('Operation failed after 3 attempts');
        expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should increase delay between retries', async () => {
        const operation = jest.fn()
            .mockRejectedValueOnce(new Error('First failure'))
            .mockRejectedValueOnce(new Error('Second failure'))
            .mockResolvedValueOnce('success');
        
        const resultPromise = RetryHandler.withRetry(operation);
        
        jest.runAllTimers();
        
        await resultPromise;
        
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 2000);
    });
}); 