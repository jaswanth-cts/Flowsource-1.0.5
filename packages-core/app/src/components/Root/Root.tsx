import React, { PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import { InfraProvisionPng } from '../../assets/icons/InfraProvisionIcon';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { CodeCompanionPng } from '../../assets/icons/CodeCompanionIcon';
import { PromptIconPng } from '../../assets/icons/PromptIcon';
import { PdlcPng } from '../../assets/icons/Pdlc';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  useSidebarOpenState,
  Link,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';

const useSidebarStyles = makeStyles({
  
  sidebarPaper: {
    display: 'flex',
    flexDirection: 'column',
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#000048 !important',
    color: 'white !important',
  },

  middleNoScroll: {
    flex: '0 0 auto',
  },

  bottomDock: {
    marginTop: 'auto',
  },

  compactItems: {
    '& .MuiListItem-root': {
      minHeight: 28,         
      height: 28,            
      paddingTop: '0 !important',    
      paddingBottom: '0 !important',
      paddingLeft: 8,
      paddingRight: 8,
      boxSizing: 'border-box',
    },
    '& .MuiListItemIcon-root': {
      minWidth: 18,
      marginRight: 6,
      '& svg': { fontSize: 16 },
      '& img': { width: 16, height: 16, objectFit: 'contain' },
    },
    '& .MuiListItemText-primary': {
      fontSize: 12,
      lineHeight: '16px',
    },
    '& .MuiListSubheader-root': {
      paddingTop: 2,
      paddingBottom: 2,
      lineHeight: '18px',
      fontSize: 12,
    },
    '& .MuiDivider-root': {
      margin: '2px 0',
    },
  },

  // Slight lift for “Menu” (optional)
  liftMenuUp: {
    marginTop: -6,
    '& .MuiListSubheader-root': {
      paddingTop: 0,
    },
  },
});

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 1.5 * sidebarConfig.logoHeight, // tighter than before
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: 0,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 16,
  },
});



const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => {
  const classes = useSidebarStyles();

  return (
    <SidebarPage>
      <Sidebar>
        <div className={`${classes.sidebarPaper} ${classes.container}`}>
          {/* TOP */}
          <SidebarLogo />

          <div style={{ marginTop: 6 }}> 
          <SidebarGroup label="Search" icon={<SearchIcon />} to="/search" className={classes.compactItems}>
            <SidebarSearchModal />
          </SidebarGroup>
        </div>

          {/* MIDDLE (no scroll) */}
          <div className={`${classes.middleNoScroll} ${classes.compactItems} ${classes.liftMenuUp}`}>
            <SidebarGroup label="Menu" icon={<MenuIcon />}>
              <SidebarItem icon={HomeIcon} to="catalog" text="Home" />
              <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
              <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
              <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />
              <SidebarItem icon={InfraProvisionPng} to="flowsource-infra-provision" text="Provisioning" />
              <SidebarItem icon={CloudDownloadIcon} to="flowsource-core" text="Downloads" />
              <SidebarItem icon={CodeCompanionPng} to="flowsource-github-copilot" text="Code Companion" />
              <SidebarItem icon={DashboardRoundedIcon} to="flowsource-dashboard" text="Dashboard" />
              <SidebarItem icon={PdlcPng} to="flowsource-pdlc" text="Agent Assist" />
              <SidebarItem icon={PromptIconPng} to="flowsource-prompt-library-metrics" text="Prompt Library" />
            </SidebarGroup>
          </div>

          {/* BOTTOM (docked) */}
          <div className={`${classes.bottomDock} ${classes.compactItems}`}>
            <SidebarDivider />
            <SidebarGroup
              label="Settings"
              icon={<UserSettingsSignInAvatar />}
              to="/settings"
            >
              <SidebarSettings />
            </SidebarGroup>
          </div>
        </div>
      </Sidebar>
      {children}
    </SidebarPage>
  );
};