import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box
} from '@mui/material';
import axios from 'axios';

const MerchantForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: '',
        catalog_url: ''
    });

    useEffect(() => {
        if (id) {
            fetchMerchant();
        }
    }, [id]);

    const fetchMerchant = async () => {
        try {
            const response = await axios.get(`/api/merchants/${id}`);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching merchant:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`/api/merchants/${id}`, formData);
            } else {
                await axios.post('/api/merchants', formData);
            }
            navigate('/admin/merchants');
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

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, mt: 4 }}>
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
                        rows={3}
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
                            onClick={() => navigate('/admin/merchants')}
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