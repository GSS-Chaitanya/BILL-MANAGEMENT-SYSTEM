import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
    Table, TableBody, TableRow, TableCell
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const shortcuts = [
    ['Ctrl + N', 'New bill'],
    ['Ctrl + F', 'Focus search'],
    ['?', 'Show shortcuts'],
    ['Esc', 'Close modals'],
];

export default function KeyboardShortcutsModal({ onClose }) {
    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700}>Keyboard Shortcuts</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Table size="small">
                    <TableBody>
                        {shortcuts.map(([key, desc]) => (
                            <TableRow key={key}>
                                <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', width: 120 }}>
                                    <Box
                                        component="kbd"
                                        sx={{
                                            px: 1, py: 0.5,
                                            borderRadius: 1,
                                            bgcolor: 'action.hover',
                                            fontSize: '0.8rem',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        {key}
                                    </Box>
                                </TableCell>
                                <TableCell>{desc}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
}
