import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: '170px',
    height: '75px',
  },
  path: {
    fill: '#7df3e1',
    width: '100%',
    height: '200%',
  },
});
const LogoFull = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 210 2079.95 456.05"
    >
      <image className={classes.path} href="/cognizant-logo-flowsource.svg"/>
    </svg>
  );
};

export default LogoFull;

