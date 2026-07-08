import * as React from 'react';
import { useState } from 'react';
import {Typography, Box, AppBar, Toolbar, TextField, Paper} from '@mui/material';
// misc buttons/icons
import { Button } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';

function LoginPage({handleSignUp}) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh" 
        sx={{ bgcolor: '#f5f5f5', p: 3 }}
        >

        <Paper 
            elevation={3} // adds shadow
            sx={{ 
                p: 4, 
                width: '100%', 
                maxWidth: 400, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3,
                borderRadius: 2
            }}
        >

            <Typography variant="h5" component="h1" fontWeight="bold" textAlign="center">
                Create an Account
            </Typography>

            <TextField 
            label="Username" 
            variant="outlined" 
            fullWidth 
            required
            onChange={(e) => setUsername(e.target.value)}
            />

            <TextField 
            label="Email Address" 
            variant="outlined" 
            fullWidth 
            required
            onChange={(e) => setEmail(e.target.value)}
            />

            <TextField 
            label="Password" 
            type="password"
            variant="outlined" 
            fullWidth 
            required
            onChange={(e) => setPassword(e.target.value)} // Connect to your state
            />

            {/* Actions Area */}
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Button 
                onClick={() => handleSignUp(username, email, password)} 
                variant="contained" 
                color="primary"
                size="large"
                fullWidth
            >
                Sign Up
            </Button>
            </Box>
        </Paper>
        </Box>
    );
}

export default LoginPage;