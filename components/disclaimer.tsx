import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DisclaimerProps {
  open: boolean;
  onClose: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({open, onClose}) => {
  return (
    <Dialog open={open}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: 'rgb(18, 18, 18)',
          color: 'white'
        }
      }}
    >
      <DialogTitle>Disclaimer</DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            color: 'white'
          }}
        >
          This is a proof of concept and is not intended for production use.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>I understand</Button>
      </DialogActions>
    </Dialog>
  )
}
