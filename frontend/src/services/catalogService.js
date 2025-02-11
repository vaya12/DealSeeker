import api from './api';

export const catalogService = {
    uploadCatalog: async (file) => {
        try {
            const formData = new FormData();
            formData.append('catalog', file);

            const response = await api.post('/catalog/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log('Upload progress:', percentCompleted);
                },
            });
            
            return response.data;
        } catch (error) {
            console.error('Error uploading catalog:', error);
            throw error.response?.data || error.message;
        }
    },

    getCatalogStatus: async (uploadId) => {
        try {
            const response = await api.get(`/catalog/status/${uploadId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting catalog status:', error);
            throw error.response?.data || error.message;
        }
    },

    getPendingCatalogs: async () => {
        try {
            const response = await api.get('/catalog/pending');
            return response.data;
        } catch (error) {
            console.error('Error getting pending catalogs:', error);
            throw error.response?.data || error.message;
        }
    }
}; 