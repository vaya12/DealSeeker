import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CatalogUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { user } = useAuth();

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'application/json') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Please select a JSON file');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('catalog', file);

        try {
            const response = await api.post('/catalog/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Catalog uploaded successfully! Waiting for admin approval.');
            setFile(null);
            
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

        } catch (err) {
            setError(err.response?.data?.error || 'Error uploading catalog');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Upload Product Catalog
            </Typography>

            <Box sx={{ my: 3 }}>
                <input
                    accept="application/json"
                    style={{ display: 'none' }}
                    id="catalog-file"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="catalog-file">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                    >
                        Select Catalog File
                    </Button>
                </label>
            </Box>

            {file && (
                <Typography variant="body2" sx={{ my: 1 }}>
                    Selected file: {file.name}
                </Typography>
            )}

            {error && (
                <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ my: 2 }}>
                    {success}
                </Alert>
            )}

            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!file || loading}
                fullWidth
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Upload Catalog'}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Note: Please upload a JSON file following our catalog format.
                Maximum file size: 10MB
            </Typography>
        </Box>
    );
};

export default CatalogUpload; 