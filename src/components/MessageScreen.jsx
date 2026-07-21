import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const MessageScreen = ({ title, message, type = 'info' }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const root = createRoot(container);

  const PopupComponent = () => {
    const [open, setOpen] = useState(true);

    const handleClose = () => setOpen(false);

    const handleDestroy = () => {
      root.unmount();
      container.remove();
    };

    const getTypeColor = () => {
      if (type === 'error') return 'error.main';
      if (type === 'success') return 'success.main';
      return 'primary.main';
    };

    return (
      <Dialog 
        open={open} 
        onClose={handleClose}
        TransitionProps={{ onExited: handleDestroy }} // wait for the animation to finish
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)', // frosty glass blur
            padding: 2,
            minWidth: '320px',
            borderRadius: 3,
            boxShadow: 24,
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, color: getTypeColor(), fontWeight: 'bold' }}>
          {title}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        </DialogContent>
      </Dialog>
    );
  };

  // render the component
  root.render(<PopupComponent />);
};

export default MessageScreen;