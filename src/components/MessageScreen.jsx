import React from 'react';
import {
    Alert,
    Box,
    Collapse,
    IconButton,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMessage } from './MessageContext';

export const MessageScreen = () => {
    const { message, hideMessage } = useMessage();

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(600px, calc(100vw - 40px))',
                zIndex: 9999,
            }}
        >
            <Collapse in={message.open}>
                <Alert
                    severity={message.type}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 4,
                        alignItems: 'flex-start',
                    }}
                    action={
                        <IconButton
                            aria-label="close message"
                            color="inherit"
                            size="small"
                            onClick={hideMessage}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold' }}
                    >
                        {message.title}
                    </Typography>

                    <Typography variant="body2">
                        {message.message}
                    </Typography>
                </Alert>
            </Collapse>
        </Box>
    );
};

export default MessageScreen;