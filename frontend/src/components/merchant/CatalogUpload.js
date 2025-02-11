import React, { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { catalogService } from '../../services/catalogService';

const Input = styled('input')({
    display: 'none',
});

const CatalogUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'application/json') {
            if (selectedFile.size > 10 * 1024 * 1024) { 
                setError('File size exceeds 10MB limit');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSuccess(null);
        } else {
            setError('Please select a valid JSON file');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            
            const result = await catalogService.uploadCatalog(file);
            
            const uploadId = result.uploadId;
            const checkStatus = async () => {
                const status = await catalogService.getCatalogStatus(uploadId);
                if (status.status === 'completed') {
                    setSuccess('Catalog uploaded and processed successfully!');
                    setLoading(false);
                } else if (status.status === 'failed') {
                    setError('Catalog processing failed: ' + status.error);
                    setLoading(false);
                } else {
                    setTimeout(checkStatus, 2000);
                }
                setUploadProgress(status.progress || 0);
            };

            checkStatus();
        } catch (err) {
            setError(err.message || 'Error uploading catalog');
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
            <Typography variant="h4" gutterBottom align="center">
                Upload Product Catalog
            </Typography>
            
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <label htmlFor="catalog-file">
                    <Input
                        accept=".json"
                        id="catalog-file"
                        type="file"
                        onChange={handleFileSelect}
                    />
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                        disabled={loading}
                    >
                        SELECT CATALOG FILE
                    </Button>
                </label>

                {file && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Selected file: {file.name}
                    </Typography>
                )}

                {loading && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Processing: {uploadProgress}%
                        </Typography>
                    </Box>
                )}

                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    sx={{ width: '100%' }}
                >
                    {loading ? <CircularProgress size={24} /> : 'UPLOAD CATALOG'}
                </Button>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                {success && (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                        {success}
                    </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                    Note: Please upload a JSON file following our catalog format. Maximum file size: 10MB
                </Typography>
            </Paper>
        </Box>
    );
};

export default CatalogUpload; 