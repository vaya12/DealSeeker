import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await merchantApi.update(id, formData);
            } else {
                await merchantApi.create(formData);
            }
            navigate('/admin');
        } catch (error) {
            console.error('Error saving merchant:', error);
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
                    />
                    
                    <TextField
                        fullWidth
                        label="Catalog URL"
                        name="catalog_url"
                        value={formData.catalog_url}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    
                    <Box sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mr: 2 }}
                        >
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
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