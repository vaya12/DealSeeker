import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { merchantApi } from '../../services/api';

const MerchantForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: '',
        catalog_url: ''
    });
    const [errors, setErrors] = useState({});

    const fetchMerchant = useCallback(async () => {
        if (id) {
            try {
                const response = await merchantApi.getById(id);
                setFormData(response.data);
            } catch (error) {
                console.error('Error fetching merchant:', error);
            }
        }
    }, [id]);

    useEffect(() => {
        fetchMerchant();
    }, [fetchMerchant]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (formData.logo.trim()) {
            try {
                new URL(formData.logo);
            } catch (e) {
                newErrors.logo = 'Please enter a valid URL';
            }
        }
        
        if (!formData.catalog_url.trim()) {
            newErrors.catalog_url = 'Catalog URL is required';
        } else {
            try {
                new URL(formData.catalog_url);
            } catch (e) {
                newErrors.catalog_url = 'Please enter a valid URL';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            if (id) {
                await merchantApi.update(id, formData);
            } else {
                await merchantApi.create(formData);
            }
            navigate('/admin');
        } catch (error) {
            console.error('Error saving merchant:', error);
            const errorMessage = error.response?.data?.error || 'Failed to save merchant';
            
            if (errorMessage.includes('name already exists')) {
                setErrors(prev => ({
                    ...prev,
                    name: 'A merchant with this name already exists'
                }));
            } else if (errorMessage.includes('catalog URL is already in use')) {
                setErrors(prev => ({
                    ...prev,
                    catalog_url: 'This catalog URL is already in use'
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    submit: errorMessage
                }));
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCancel = () => {
        navigate('/admin');
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {id ? 'Edit Merchant' : 'Add New Merchant'}
                </Typography>
                
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    
                    <TextField
                        fullWidth
                        label="Logo URL"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        margin="normal"
                        error={!!errors.logo}
                        helperText={errors.logo}
                        placeholder="https://example.com/logo.png"
                    />
                    
                    <TextField
                        fullWidth
                        label="Catalog URL"
                        name="catalog_url"
                        value={formData.catalog_url}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={!!errors.catalog_url}
                        helperText={errors.catalog_url}
                        placeholder="https://example.com/catalog"
                    />
                    
                    {errors.submit && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {errors.submit}
                        </Alert>
                    )}
                    
                    <Box sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ 
                                mr: 2,
                                bgcolor: '#6CA390',
                                '&:hover': {
                                    bgcolor: '#5b8c7d'
                                }
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            sx={{
                                color: '#6CA390',
                                borderColor: '#6CA390',
                                '&:hover': {
                                    borderColor: '#5b8c7d'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default MerchantForm; 