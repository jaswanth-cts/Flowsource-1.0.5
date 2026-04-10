import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: '50px',
    height: '150px',
  },
  path: {
    fill: '#7df3e1',
    width: '300px',
    height: '300px',
  },
});

const LogoIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 337.46 428.5"
    >
      <image className={classes.path} href="/cognizant-logo-flowsource.svg"/>
    </svg>
  );
};

export default LogoIcon;

