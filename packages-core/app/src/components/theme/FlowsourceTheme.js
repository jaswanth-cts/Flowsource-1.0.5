import {
  createBaseThemeOptions,
  createUnifiedTheme,
  palettes,
} from '@backstage/theme';

export const FlowsourceTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      ...palettes.light,
      primary: {
        main: '#white',
      },
      secondary: {
        main: '#ffffff',
      },
    },
  }),
  defaultPageTheme: 'home',
  /* below drives the header colors */
 
  components: {
    BackstageHeader: {
      styleOverrides: {
        header: () => ({
          backgroundImage: 'url(/catalog-banner.png)',
        }),
      },
    },
 
    BackstageSidebarItem: {
      styleOverrides: {
        root: params => ({
          color: 'white !important',
          borderLeft: 'none !important',
          marginLeft: '0.6em !important',
          width: '88% !important',
          borderRadius: '2px',
          borderBottom: '1px solid deepskyblue',
          '&:hover': {
            backgroundColor: 'skyblue !important',
            color: 'navy !important',
          },
          '&[data-testid="login-button"]': {
            bottom: '0.5em',
          },
          '&[aria-label="Settings"]': {
            position: 'absolute',
            bottom: '0',
          },
        }),
      },
    },
    BackstageIconLinkVertical: {
      styleOverrides: {
        link: () => ({
          color: 'black !important',
        }),
      },
    },
    MuiButton:{
      styleOverrides:{
          containedPrimary:()=>({
            backgroundColor:'#1F5493',
            color:'#ffffff',
            '&:hover':{
              backgroundColor:'#1F5493',
            color:'#ffffff',
            }
          }),
      },
    },

    MuiTypography: {
      styleOverrides: {
        
        body1: () => ({
          fontSize: 'inherit',
        }),
        
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: () => ({
          // Default styles for all table cells
          '&:nth-child(1), &:nth-child(2), &:nth-child(3), &:nth-child(4), &:nth-child(7)': {
            whiteSpace: 'nowrap',
          }
        }),
      },
    },
   
    MuiSvgIcon: {
      styleOverrides: {
        root: () => ({
          fontSize: 'medium',
         
          '&:hover': {
            backgroundColor: 'skyblue !important',
            color: 'navy !important',
          },
        }),
      },
    },
  },
});