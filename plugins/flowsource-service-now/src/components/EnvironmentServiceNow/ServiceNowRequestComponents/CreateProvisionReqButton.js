import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import addIcon from '../../Icons/add_icon.png';

const CreateProvisionReqButton = ({ classes, onClick }) => {
  return (
    <div style={{ width: '45px' }}>
      <a href="#" onClick={onClick} style={{ width: '2rem' }}>
        <IconButton style={{ borderRadius: '25px', height: '40px', width: '100%' }}>
          <img
            src={addIcon}
            alt="Goto Service Now Server"
            className={classes.addIconImg}
            style={{ width: '2rem' }}
          />
        </IconButton>
      </a>
    </div>
  );
};

export default CreateProvisionReqButton;
