import {
  createBaseThemeOptions,
  createUnifiedTheme,
  palettes,
} from '@backstage/theme';

export const FlowsourceHomeTheme = createUnifiedTheme({
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


    MuiTableRow: {
      styleOverrides: {
        root: {
          color: 'white !important',
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          flexWrap: 'wrap',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          justifyContent: 'space-between',
          borderWidth: 'none',
          height: '-540px !important',
          '&[index],&[level]': {
            border: '1px solid black',
          },
        },
      },
    },
    BackstageHeader: {
      styleOverrides: {
        header: () => ({
          backgroundImage: 'url(/catalog-banner.png)',

        }),
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: () => ({
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(250px,1fr))',
          height: '-540px !important',
          gridGap: '1rem',
          padding: '10px',
          overflowWrap: 'anywhere',
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          display: 'none !important',
        },
      },
    },


    MuiChip: {
      styleOverrides: {
        outlined: {
          display: 'none !important',
        },
      },
    },

    BackstageSidebarItem: {
      styleOverrides: {
        root: params => ({
          color: 'white !important',
          borderLeft: 'none !important',
          marginLeft: '0.6em !important',

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
    PluginCatalogGraphCustomNode: {
      styleOverrides: {
        node: {
          fill: '#599ddd !important',
        },
      },
    },
    BackstageInfoCard: {
      styleOverrides: {
        headerTitle: {
          color: '#274cbb',
          fontSize: 'x-large',
          fontWeight: 500,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        displayBlock: {
          color: '#274cbb !important',
          fontSize: 'x-large !important',
          fontWeight: 500,
        },
        h5: () => ({
          color: 'midnightblue !important',
          fontWeight: '500',
        }),
      },
    },


    MuiImageListItem: {
      styleOverrides: {
        item: () => ({
          color: '#6a85d7',
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
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          //   color:'darkblue',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        label: {
          color: 'black !important',
        },
        colorInherit: {
          color: 'midnightblue !important',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        elevation1: {

        },
      },
    },
    BackstageBottomLink: {
      styleOverrides: {
        root: {
          marginLeft: 'auto !important',
          display: 'flex !important',
          alignItems: 'center !important',
          color: 'black !important',
          position: 'absolute',
          top: '0px',
          right: '-19px',
          clipPath: 'polygon(0 0, 101% 0%, 100% 100%, 14% 100%)',
          backgroundColor: '#d9d9d9',

          padding: ' 14px 25px 11px 47px',

          backgroundImage: 'url("/bar-graph.png")',
          backgroundRepeat: 'no-repeat !important',
          backgroundPosition: '15px',
        },
      },
    },

    MuiCardHeader: {
      styleOverrides: {
        title: {
          color: '#274cbb',
          fontSize: 'x-large',
          fontWeight: 500,
        },
        root: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        action: {
          display: 'flex !important',
          alignItems: 'center !important',
          justifyContent: 'flex-end !important',
          marginLeft: 'auto !important',
          position: 'absolute !important',
          left: '83px !important ',
        },
        content: {
          flexFlow: 1,
        },
      },
    },


    MuiButton: {
      styleOverrides: {
        root: () => ({
          backgroundColor: '#1F5493 ',
          color: 'white !important',
          '&:hover': {
            backgroundColor: 'skyblue !important',
            color: 'white !important',
          },
          '&[aria-label="Search"]': {
            backgroundColor: '#000048 !important',
            borderRadius: '2px !important',
          },
        }),
        containedPrimary: () => ({
          backgroundColor: '#1F5493',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1F5493',
            color: '#ffffff',
          }
        }),
      },
    },

    BackstageSubvalueCell: {
      styleOverrides: {
        subvalue: () => ({
          color: 'black !important',
          display: '-webkit-box !important',
          WebkitLineClamp: '2 !important',
          WebkitBoxOrient: 'vertical !important',
          overflow: 'hidden !important',
          textOverflow: 'ellipsis !important',
          width: 'fit-content !important',
        }),
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          backgroundColor: 'white !important',
          position: 'relative',
          bottom: '-22px',
          '&:nth-child(1)::after ': {
            backgroundColor: 'white !important',
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        components: () => ({
          '&:hover': {
            color: 'white !important',
          },
        }),
        root: () => ({
          color: 'black !important',
          padding: '7px !important',
          margin: '0 !important',
          border: 'none !important',
          width: '100% !important',
          '&[value="website"],&[value="experimental"],&[value="production"]': {
            display: 'none !important',
          },
          '&:nth-child(1)::after ': {
            content: '""',
            display: 'block',
            width: '43%',
            height: '4px',
            backgroundColor: 'midnightblue',
            marginTop: '5px',
          },
          '&:last-child': {
            backgroundColor: 'rgba(1, 1, 1, 0.24) ',

            borderRadius: '0 0 10px 10px',
          },
          '&[colspan="9"]': {
            backgroundColor: 'white !important',
            position: 'absolute',
            alignItems: 'center',
            left: '290px',

            '&:nth-child(1)::after ': {
              backgroundColor: 'white !important',

            },
          },
        }),
      },
    },
    CatalogReactEntityDisplayName: {
      styleOverrides: {
        root: () => ({
          fontSize: 'medium',
        }),
      },
    },
  },
});