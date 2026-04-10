

import React, { useState, useEffect } from 'react';
import { Grid,Table, TableHead, TableBody, TableRow, TableCell  } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import {
  Page,
  Header,
  Content,
} from '@backstage/core-components';

import cssClasses from './InfraProvisionCss';
import {  configApiRef, useApi, identityApiRef, fetchApiRef } from '@backstage/core-plugin-api';


import {  Link } from 'react-router-dom';

import { COMPONENT_HEADER, COMPONENT_PAGE_HEADER_CARDS, COMPONENT_ROOT_PATH } from '../../constants';



const ErrorPage = (props)=>{
  const {message} = props;
  const classes = cssClasses();
  return (
    <>
    
          <Grid container>
          <Grid item xs={12} >
      <Table className="infra provision" aria-label=" infra provision Data">
        <TableHead className={` ${classes.tableHeader} pt-2`}>
          <TableRow >
            <TableCell key={0} className={` ${classes.tableHeader} pt-2`}>{'Error'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        <TableRow key={0}>
            <TableCell colSpan={5} align="center" >{message}</TableCell>
        </TableRow>
        </TableBody>

      </Table>
    </Grid>
    </Grid>
 
 
    </>
  )
}

const Card = ({ catalogId, title, description, color, footerColor, onClick }) => {
  const classes = cssClasses();
  return (
    <div>
      <div className={`row`}>
        <div className={`col ${classes.cardsRow}`} >
          <div className={`card ${classes.card}`} style={{ backgroundColor: color }}>
            <h4 className={` mt-4 ms-3 ${classes.title1}`}>{title}</h4>
            <p className={`mt-4 ms-3 ${classes.description}`}>{description}</p>
            <div className={`card-footer ${classes.footer}`} style={{ backgroundColor: footerColor }}>

              <div className={classes.buttonSection}>
                <Link to={`${COMPONENT_ROOT_PATH}/config`} 
                  state={{ catId: catalogId }}
                >
                  <button onClick={onClick} className={`${classes.button} float-end`}>
                    Provision
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardsPage = () => {

  const colors = ['#127FFF', '#896FF3', '#109BD7'];
  const footerColors = ['#6fa6e8', '#ab99f6', '#50cbf2'];
  const classes = cssClasses();
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const [catalogItems, setCatalogItems] = useState([]);
  const [apiError, SetApiError] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { fetch } = useApi(fetchApiRef);

  useEffect(() => {
    async function initialize() {
      try {
        const authTok = await identityApi.getCredentials();
        setAuthToken(authTok.token);
      } catch (err) {
        SetApiError(err.message);
      }
    }
    initialize();
  }, []);


  useEffect(async () => {
    let reponse = undefined;
    setIsLoading(true);
    try {
      const resp = await fetch(backendUrl + '/api/flowsource-morpheus/catalogs');
      reponse = await resp.json();

      if (resp.ok) {
        setCatalogItems(reponse.catalogItemTypes)
      }
      else {
        SetApiError(resp.statusText);
      }
    } catch (err) {
      SetApiError(err.message);
    } finally{
      setIsLoading(false);
    }
  }, [authToken])

  return (
    <>
      <Page themeId="home">
      <Header title={COMPONENT_HEADER} />
      {isLoading ? (
         <div className="App p-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '20vh', marginTop: '15vh' }}>
         Loading...
     </div>
              ) : (
      <Content>
      <Grid container spacing={1}>
        <Grid item xs={10}>
            <h2 className={`${classes.title}`} >{COMPONENT_PAGE_HEADER_CARDS}</h2>
        </Grid>

  
      </Grid>
        <div>
      <Grid container spacing={2}>
        {catalogItems && catalogItems.length > 0 ? catalogItems.map((card, index) => (
          <Grid item xs={12} sm={4} key={card.id}>
            <Card
              catalogId={card.id}
              title={card.name}
              description={card.description}
              color={colors[index % 3]}
              footerColor={footerColors[index % 3]} // Pass footer color to Card
            />
          </Grid>
        )):
        <>
        <ErrorPage message = {apiError?"Some error occured when fetching data":"No data...."}/>
        </>
      }
      </Grid>
      <Grid container  justify="flex-end">
        <Link to={`${COMPONENT_ROOT_PATH}`}>
          <button className={`${classes.backbutton} float-end`}>Back</button>
        </Link>
      </Grid>
    </div>
    </Content>
    )}
    </Page>
    </>
  );
};

export default CardsPage;

