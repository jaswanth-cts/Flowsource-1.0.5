import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import botimage from './Icons/bot.svg';
import cssClasses from './JiraPageCss';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization
// import CloseIcon from '@material-ui/icons/Close';

const JiraBot = ({ fetch, backendBaseApiUrl, projectName }) => {

  const classes = cssClasses();
  const [isOpen, setIsOpen] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [jiraBotUrl, setJiraBotUrl] = useState('');

  const close = () => setIsOpen(false);
  const handleToggleDrawer = async () => {
    setIsOpen(!isOpen);
    const response = await fetch(backendBaseApiUrl + 'jiraBotUrl');
    if (response.ok) {
      const data = await response.json();
      setJiraBotUrl(data.jiraBotUrl);
    } else {
      console.error('Failed to fetch Jira Bot URL');
    }
  }

  return (
    <div className={`${classes.jiraBotButton}`}>
      <Button onClick={handleToggleDrawer}>
        <img src={botimage} alt="Bot" />
      </Button>
      <Drawer
        PaperProps={{
          sx: {
            width: '90%',
            height: '90%',
            position: 'relative',
            top: '5%',
            left: '5%',
            right: '5%',
          },
        }}
        anchor="bottom"
        open={isOpen}
        onClose={close}
      >
        <iframe
          src={DOMPurify.sanitize(jiraBotUrl)} // Sanitize the URL before embedding it
          title="Bot Popup"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </Drawer>
    </div>
  );
};

export default JiraBot;
