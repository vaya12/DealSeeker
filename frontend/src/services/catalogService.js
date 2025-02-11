submitReview: async (catalogId, reviewData) => {
    try {
        const response = await api.post(`/catalog/${catalogId}/review`, reviewData);
        return response.data;
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error.response?.data || error.message;
    }
};

getCatalogPreview: async (catalogId) => {
    try {
        const response = await api.get(`/catalog/${catalogId}/preview`);
        return response.data;
    } catch (error) {
        console.error('Error getting catalog preview:', error);
        throw error.response?.data || error.message;
    }
} ;