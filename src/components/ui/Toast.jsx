import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function Toast({ message, type, onHide }) {
    return (
        <Snackbar
            open={!!message}
            autoHideDuration={3000}
            onClose={onHide}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                severity={type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'}
                variant="filled"
                onClose={onHide}
                sx={{ borderRadius: 2, fontWeight: 500 }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
