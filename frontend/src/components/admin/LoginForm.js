import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { authApi } from '../../services/api';

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login(formData);
            localStorage.setItem('token', response.data.token);
            navigate('/admin');
        } catch (error) {
            setError('Invalid credentials');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5'
            }}
        >
            <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Paper 
                    elevation={3}
                    sx={{ 
                        p: 4, 
                        width: '100%',
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: '0 3px 10px rgb(0 0 0 / 0.2)'
                    }}
                >
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        align="center" 
                        gutterBottom
                        sx={{ 
                            color: '#000000',
                            mb: 4,
                            fontWeight: 500,
                            fontFamily: "'Saira Stencil One', sans-serif",
                        }}
                    >
                        Admin Login
                    </Typography>
                    
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 2,
                                borderRadius: 1
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ 
                                mt: 4,
                                mb: 2,
                                py: 1.5,
                                backgroundColor: '#7BA89A',
                                '&:hover': {
                                    backgroundColor: '#6a9587'
                                },
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                color: '#ffffff',
                                fontFamily: "'Saira Stencil One', sans-serif",
                            }}
                        >
                            LOGIN
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginForm; 