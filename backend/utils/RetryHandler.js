class RetryHandler {
    static async withRetry(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.error(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    console.log(`Retrying in ${delay/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                }
            }
        }
        
        throw new Error(`Operation failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
    }
}

module.exports = RetryHandler; 