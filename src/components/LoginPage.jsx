import * as React from 'react';
import { useState } from 'react';
import {Typography, Box, AppBar, Toolbar, TextField, Paper} from '@mui/material';
// misc buttons/icons
import { Button } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';

function LoginPage({title, handleSignUp, handleLogin}) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [login, setLogin] = useState(false); // to toggle relevant login or signup elements off/on. 
    // login = true shows the login page, login = false shows the signup page.

    const handleChangeLogin = () => {
        setLogin(login ? false : true);
        

        // clear all fields.
        // setUsername('');
        // setEmail('');
        // setPassword('');
    };

    return (
        <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh" 
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
                {login ? "Login to " + title : "Create an Account"}
            </Typography>

            <TextField 
            label="Username" 
            variant="outlined" 
            fullWidth 
            required
            onChange={(e) => setUsername(e.target.value)}
            />

            {(login === false) && <TextField 
            label="Email Address" 
            variant="outlined" 
            fullWidth 
            required
            onChange={(e) => setEmail(e.target.value)}
            />}

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
                    onClick={() => {login ? handleLogin(username, password) : handleSignUp(username, email, password)}} 
                    variant="contained" 
                    color="primary"
                    size="large"
                    fullWidth
                >
                    {login ? "Log in" : "Sign Up"}
                </Button>
            </Box>

            <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <Typography>
                    {login ? "Don't have an account?" : "Already have an account?"}
                    <Button 
                        onClick={() => handleChangeLogin()} 
                        variant="text" 
                        color="primary"
                        disableRipple
                        sx={{ 
                            textTransform: 'none', // prevents caps lock like most buttons.
                            padding: 0,           // remove padding of the button
                            minWidth: 'auto',
                            marginLeft: 1,  
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: 'transparent', // removes button hover box
                                textDecoration: 'underline',   // underlines when hovered
                            }
                        }}
                    >
                        {login ? "Sign up" : "Log in"}
                    </Button>
                </Typography>

            </Box>
        </Paper>
        </Box>
    );
}

export default LoginPage;