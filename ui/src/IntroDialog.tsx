import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function IntroDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasOpened = localStorage.getItem('hasOpened');
    if (!hasOpened) {
      setOpen(true);
      localStorage.setItem('hasOpened', 'true');
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <br />
        <DialogContentText>
          New to Apache JMeter Docker Extension? Watch this video to get started.
        </DialogContentText>
        <br />
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/OOm9iwC7f44" 
          title="Introduction to Apache JMeter Docker Extension" 
          style={{ border: 0 }} 
          allowFullScreen>
        </iframe>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Skip</Button>
      </DialogActions>
    </Dialog>
  );
}