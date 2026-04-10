import React, { useState, useEffect, useCallback } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import cssClasses from './ZephyrPageCss.js';
import { useEntity } from '@backstage/plugin-catalog-react';
import { EntitySwitch, } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PluginVersion from '../PluginVersion/PluginVersion';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import totalTestCasesIcon from './Icon/test_case_icon.png';
import totalDefectsIcon from './Icon/total_defect_icon.png';
import StoriesWithoutTestCases from './StoriesWithoutTestCases.js';
import Defects from './Defects.js';
import TestCycle from './TestCycle.js';
import { styled } from "@mui/material/styles";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ErrorDisplay from './ErrorDisplay.js';

const STORIES_JIRA = "flowsource/jira-project-key";
const DURATION_DAYS_CATALOG = "flowsource/durationInDays";

const missingAnnotationWarning = () => {
	return (
		<div className='mt-3 ms-3 me-3 mb-4'>
			<EntitySwitch>
				<EntitySwitch.Case>
					<EmptyState
						title="No Zephyr page is available for this entity"
						missing="info"
						description="You need to add an annotation to your component if you want to see Zephyr page for it."
					/>
				</EntitySwitch.Case>
			</EntitySwitch>
		</div>
	);
};

const ZephyrPage = () => {

	const classes = cssClasses();
	const { entity } = useEntity();
	const { fetch } = useApi(fetchApiRef);
	const config = useApi(configApiRef);

	const [configurationError, setConfigurationError] = useState();
	const [totalDefectsError, setTotalDefectsError] = useState();
	const [totalTestCasesError, setTotalTestCasesError] = useState();

	const [loadingTotalTestCases, setLoadingTotalTestCases] = useState(true);
	const [loadingTotalDefects, setLoadingTotalDefects] = useState(true);

	const [totalTestCases, setTotalTestCases] = useState([]);
	const [totalDefects, setTotalDefects] = useState([]);

	const [onlyActiveSprints, setOnlyActiveSprints] = useState(true);

	// Check if the specific annotation for Zephyr exists
	const annotations = entity.metadata.annotations;
	const shouldRenderZephyrPage = !!annotations && STORIES_JIRA in annotations;
	const durationDaysCatalog = annotations?.[DURATION_DAYS_CATALOG];

	const projectKey = entity.metadata.annotations[STORIES_JIRA];
	const backendBaseApiUrl = `${config.getString('backend.baseUrl')}/api/flowsource-zephyr/`;

    const handleError = async (response, setError) => {
        let errorMessage = 'Error fetching details from Zephyr. ';
        try {
            const errorBody = await response.json();
			if (errorBody.status === 503) { // Configuration error
				setConfigurationError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
				return;
			}
			if (typeof errorBody?.error === 'string' && errorBody.error.includes('No project found')){
				errorMessage = "No project could be found with key \"" + projectKey + "\" in Zephyr. Please check the project key and try again.";
			}
			
        } catch (e) {
          // Ignore JSON parsing errors and use the default error message
        }
        setError(errorMessage);
    };

	const fetchTotalTestCases = useCallback(async () => {
		setLoadingTotalTestCases(true);
		try {
			const response = await fetch(`${backendBaseApiUrl}testcases/count?projectKey=${projectKey}`);
			if (response.ok) {
				const result = await response.json();
				setTotalTestCases(result);
                setTotalTestCasesError('');
			} else {
				handleError(response, setTotalTestCasesError);
				setTotalTestCases([]);
			}
		} catch (fetchError) {
			handleError(fetchError, setTotalTestCasesError);
			setTotalTestCases([]);
		} finally {
			setLoadingTotalTestCases(false);
		}
	}, [backendBaseApiUrl, fetch, projectKey]);

	useEffect(() => {
		fetchTotalTestCases();
	}, [fetchTotalTestCases]);

	const fetchTotalDefects = useCallback(async () => {
		setLoadingTotalDefects(true);
		try {
			const url = `${backendBaseApiUrl}defects/count?projectKey=${projectKey}&onlyActiveSprints=${onlyActiveSprints}&durationDaysCatalog=${durationDaysCatalog}`;
			const response = await fetch(url);
			if (response.ok) {
				const result = await response.json();
				setTotalDefects(result);
                setTotalDefectsError('');
			} else {
				handleError(response, setTotalDefectsError);
				setTotalDefects([]);
			}
		} catch (fetchError) {
			handleError(fetchError, setTotalDefectsError);
			setTotalDefects([]);
		} finally {
			setLoadingTotalDefects(false);
		}
	}, [backendBaseApiUrl, durationDaysCatalog, fetch, onlyActiveSprints, projectKey]);

	useEffect(() => {
		fetchTotalDefects();
	}, [fetchTotalDefects]);

	const handleActiveSprintsClick = () => {
	  setOnlyActiveSprints(true);
	};
  
	const handleAllSprintsClick = () => {
	  setOnlyActiveSprints(false);
	};

	const BootstrapButton = styled(Button)({
	  fontsize: '13px',
	  height: '25px',
	  textTransform: 'none',
	});
	return (
		<div className="row w-100">
		  <div className={`${classes.mainPageTab} w-100`}>
			<div className="row w-100">
			  <div className={`${classes.pluginHeading}`}>
				<div>
				  <h5>
					<b> Zephyr - {projectKey}</b>
				  </h5>
				</div>
				<div>
				  <PluginVersion />
				</div>
			  </div>
			</div>
		  </div>
		  {shouldRenderZephyrPage ? (
			<>
			  {configurationError && <ErrorDisplay error={configurationError} />}
	  
			  {!configurationError && (
				<div>
				  {totalDefectsError && <ErrorDisplay error={totalDefectsError} />}
				  {totalTestCasesError && <ErrorDisplay error={totalTestCasesError} />}
	  
				  <ButtonGroup
					variant="outlined"
					aria-label="Sprint button group"
					className={classes.buttonGroupStyle}
				  >
					<BootstrapButton
					  onClick={handleActiveSprintsClick}
					  className={onlyActiveSprints ? classes.activeSprintButton : classes.inactiveSprintButton}
					>
					  Active Sprint
					</BootstrapButton>
					<BootstrapButton
					  onClick={handleAllSprintsClick}
					  className={!onlyActiveSprints ? classes.activeSprintButton : classes.inactiveSprintButton}
					>
					  All Sprints
					</BootstrapButton>
				  </ButtonGroup>
				  <div>
					<div className={`${classes.cardItems}`} style={{ marginLeft: '1rem' }}>
					  <Card variant="outlined" className={`${classes.cards}`}>
						<div className={`${classes.cardsTitle}`}>
						  <Typography className={`${classes.cardsTitleText}`}>Total Test Cases</Typography>
						  <img className={classes.cardImage}
							src={totalTestCasesIcon}
							alt='Total Test Cases Icon'
						  />
						</div>
						<div className={`${classes.cardsValue}`}>
						  {loadingTotalTestCases ? (
							<p className={`${classes.loadingText}`}>Loading...</p>
						  ) : (
							<Typography variant="h5" className={classes.totalTestCasesValue}>{totalTestCases}</Typography>
						  )}
						</div>
					  </Card>
					  <Card variant="outlined" className={`${classes.cards} ${classes.totalDefectsCard}`}>
						<div className={`${classes.cardsTitle}`}>
						  <Typography className={`${classes.cardsTitleText}`}>Total Defects</Typography>
						  <img className={classes.cardImage}
							src={totalDefectsIcon}
							alt='Total Defects Icon'
						  />
						</div>
						<div className={`${classes.cardsValue}`}>
						  {loadingTotalDefects ? (
							<p className={`${classes.loadingText}`}>Loading...</p>
						  ) : (
							<Typography variant="h5" className={classes.totalDefectsValue}>{totalDefects}</Typography>
						  )}
						</div>
					  </Card>
					</div>
				  </div>
	  
				  <StoriesWithoutTestCases backendBaseApiUrl={backendBaseApiUrl} projectKey={projectKey} onlyActiveSprints={onlyActiveSprints} durationDaysCatalog={durationDaysCatalog} />
	  
				  <Defects backendBaseApiUrl={backendBaseApiUrl} projectKey={projectKey} onlyActiveSprints={onlyActiveSprints} durationDaysCatalog={durationDaysCatalog} />
	  
				  <TestCycle backendBaseApiUrl={backendBaseApiUrl} projectKey={projectKey} />
				</div>
			  )}
			</>
		  ) : (
			missingAnnotationWarning()
		  )}
		</div>
	  );
	
}
export default ZephyrPage;
