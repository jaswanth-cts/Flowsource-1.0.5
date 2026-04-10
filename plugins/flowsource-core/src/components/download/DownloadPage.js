import React from 'react';
import { Grid } from '@material-ui/core';
import cssClasses from './downloadpageCSS';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Page, Header } from '@backstage/core-components';
import { COMPONENT_HEADER } from './constant';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';

import log from 'loglevel';

const Card = ({ title, description, color, footerColor, onClick }) => {
  const classes = cssClasses();
  return (
    <div>
      <div className={`row`}>
        <div className={`col ${classes.cardsRow}`}>
          <div
            className={`card ${classes.card}`}
            style={{ backgroundColor: color }}
          >
            <h4 className={` mt-4 ms-3 ${classes.title}`}>{title}</h4>
            <p className={`mt-4 ms-3 ${classes.description}`}>{description}</p>
            <div
              className={`card-footer ${classes.footer}`}
              style={{ backgroundColor: footerColor }}
            >
              <div className={classes.buttonSection}>
                <button
                  onClick={onClick}
                  className={`${classes.button} float-end`}
                >
                  <CloudDownloadIcon /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DownloadPage = () => {
  const cardsData = [
    {
      id: 1,
      title: 'Cognizant Prompt Library - VS Code',
      description:
        'Accelerate the development process by leveraging Cognizant Prompt Library',
      fileName: 'VSCode-cognizant-code-companion-prompt-library-3.1.1.zip',
    },
    {
      id: 2,
      title: 'Cognizant Prompt Library - Intellij',
      description:
        'Accelerate the development process by leveraging Cognizant Prompt Library',
      fileName: 'IntelliJ-Cognizant-Code-Companion-Prompt-Library-4.1.1.zip',
    },
    {
      id: 3,
      title: 'Fetch OpenAPI Spec',
      description:
        'Fetches the OpenAPI spec from the provided URL and save it to specific file',
      fileName: 'cognizant-Fetch-OpenAPI-Spec-utility-3.0.0.zip',
    },
  ];

  const colors = ['#127FFF', '#896FF3', '#453de0'];
  const footerColors = ['#6fa6e8', '#ab99f6', '#6861ed'];
  const config = useApi(configApiRef);
  const { fetch } = useApi(fetchApiRef);
  const backendBaseApiUrl =
    config.getString('backend.baseUrl') + '/api/flowsource-core/';

  const handleDownloadClick = async fileName => {
    try {
      // Make an HTTP request to your backend's /download-zip endpoint
      const response = await fetch(
        backendBaseApiUrl + 'download-zip?fileName=' + fileName,
      );
      log.info(JSON.stringify(response));
      if (response.ok) {
        // Convert the response to a blob (assuming it's a zip file)
        const blob = await response.blob();
        log.info(response);

        // Create a temporary URL for the blob
        const url = URL.createObjectURL(blob);

        // Trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        // Clean up the temporary URL
        URL.revokeObjectURL(url);
      } else {
        log.error('Error downloading the zip file');
      }
    } catch (error) {
      log.error('An error occurred:', error);
    }
  };

  return (
    <div>
      <Page themeId="home">
        <Header title={COMPONENT_HEADER} />
        <div>
          <div className={` mt-4 ms-5`}>
            <Grid container spacing={2}>
              {cardsData.map((card, index) => (
                <Grid item xs={6} sm={5} key={card.id}>
                  <Card
                    title={card.title}
                    description={card.description}
                    color={colors[index % colors.length]}
                    footerColor={footerColors[index % footerColors.length]}
                    onClick={() => handleDownloadClick(card.fileName)}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </Page>
    </div>
  );
};

export default DownloadPage;