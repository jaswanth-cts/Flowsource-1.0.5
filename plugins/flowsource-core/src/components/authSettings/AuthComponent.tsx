import React, { useEffect, useState } from 'react';
import { AuthSettingsPage } from './AuthSettingsPage';
import { configApiRef, useApi, identityApiRef } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components'; // Import Progress for loading state
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  IconButton,
  Paper,
  makeStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import cssClasses from './AuthComponentCss';

export const AuthComponent = () => {
  const config = useApi(configApiRef);
  const identity = useApi(identityApiRef); // Access the identity API
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // State to track admin status
  const adminGroup = config.getString(
    'flowsourceSettings.adminGroup',
  );
  useEffect(() => {
    const checkAdmin = async () => {
      const user = await identity.getBackstageIdentity(); // Await the resolved identity
      const userGroups = user.ownershipEntityRefs || []; // Get the user's groups
      setIsAdmin(userGroups.includes(adminGroup)); // Check if the user is in the admin group
    };

    checkAdmin();
  }, [identity]);

  // Show a loading state while checking admin status
  if (isAdmin === null) {
    return <Progress />;
  }

  return isAdmin ? <AuthSettingsPage /> : <NoPermissionPage />;
};
const useStyles = makeStyles((theme) => ({
  warningBackground: {
    backgroundColor: "rgb(255, 247, 237)", // Warning color for the accordion header
    color: theme.palette.warning.contrastText, // Text color for better contrast
  },
  paperContent: {
    backgroundColor: theme.palette.common.white, // White background for the Paper
    padding: theme.spacing(2), // Add padding inside the Paper
    borderRadius: theme.shape.borderRadius, // Rounded corners
  },
}));
const NoPermissionPage = () => {
  const classes1 = cssClasses();
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);

  const handleAccordionToggle = () => {
    setExpanded((prev) => !prev); // Toggle the accordion state
  };

  return (
    <Accordion expanded={expanded} onChange={handleAccordionToggle} className={classes.warningBackground}>
      {/* Accordion Header */}
      <AccordionSummary
        expandIcon={
          <IconButton>
            <ExpandMoreIcon />
          </IconButton>
        }
        aria-controls="no-permission-content"
        id="no-permission-header"
      >
        <Grid container alignItems="center" spacing={1}>
          {/* Info Icon */}
          <Grid item>
            <InfoOutlinedIcon className={`${classes1.infoIcon}`} />
          </Grid>

          {/* Access Denied Text */}
          <Grid item>
            <Typography variant="subtitle1" className={`${classes1.textCss}`}>
              <b>Access Denied</b>
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>

      {/* Accordion Content */}
      <AccordionDetails>
        <Grid container spacing={2} className={`${classes1.gridCss}`}>
          <Grid item xs={12}>
            <Paper className={classes.paperContent}>
              <Typography>
                Only users with the <strong>admin</strong> privilege can view this page.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default NoPermissionPage;
