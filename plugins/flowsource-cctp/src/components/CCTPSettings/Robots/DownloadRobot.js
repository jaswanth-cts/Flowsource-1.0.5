import React from 'react';


import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './RobotsMainPageCss';

import DOWNLOAD_ICON from '../../Icons/download_icon.png';

import JSZip from 'jszip';

import log from 'loglevel';


const DownloadRobot = ({id, setErrorMessage, setEnableDownloadPopUp, setIsApiError}) => {

    const classes = cssClasses();
    
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    async function getRobotJavaJarFileFromApi() {
        try 
        {
            let javaJarFile = null;
            const jarResponse = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/download/`);

            if (jarResponse.ok) 
            {
                //fetches full binary data.
                const jarBuffer = await jarResponse.arrayBuffer(); 

                //Converting array buffer to blob.
                javaJarFile = new Blob([jarBuffer], { type: 'application/java-archive' });

                if (javaJarFile === null || javaJarFile === undefined) 
                {
                    log.info("Error: Status: 200, Message: File Data Unavailable.");

                    const formattedError = `Error: Status: ${jarResponse.status}, Message: JAR File Data Unavailable.`;
                    setErrorMessage(formattedError);
                    setEnableDownloadPopUp(false);
                    setIsApiError(true);
                    return null;  //Need to return null here. Otherwise, Zip will be created with an empty jar file.
                }

                return javaJarFile; //Returning the JAVA jar blob here.

            } else {
                const apiErrorText = await jarResponse.text();
                log.info('Error: API returned: ' + jarResponse.status + ' - ' + apiErrorText);

                const formattedError = `HTTP Error: Status: ${jarResponse.status}, Message: Error Creating File.`;
                setErrorMessage(formattedError);
                setEnableDownloadPopUp(false);
                setIsApiError(true);
                return null; //Need to return null here. Otherwise, Zip will be created with an empty jar file.
            }

        } catch (error) {
            log.info('Error in getRobotJavaJarFileFromApi function: ', error);

            setErrorMessage('Application Error: Error retriving Java jar file.');
            setIsApiError(true);
            
            return null; //Need to return null here. Otherwise, Zip will be created with an empty jar file.
        }
    };

    async function downloadRobotDataOnClick(robotId) {
        try
        {
            setEnableDownloadPopUp(true);

            //STEP 1: Download the Java Jar file. Exract the file and get the blob.
            let javaJarFile = null;
            javaJarFile = await getRobotJavaJarFileFromApi();

            if(javaJarFile === null || javaJarFile === undefined) {
                return; //Need to stop method execution here. Otherwise, Zip will be created with an empty jar file.
            }
           
            //STEP 2: Extract the robot properties from API response as JSON object.
            let robotProperties = "";
            let robotName = "";
            const propertiesResponse = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/robots/${robotId}/token`);
            
            if (propertiesResponse.ok) 
            {
                const data = await propertiesResponse.json();

                if(data !== null && data !== undefined) 
                {
                    const targetUrlResp = await fetch(`${backendBaseApiUrl}cctp-config`);
                    const robotUrlJson = await targetUrlResp.json();

                    const robotUrl = robotUrlJson.url;

                    if(robotUrl === null || robotUrl === undefined || robotUrl.length === 0) {
                        
                        log.info('Error: Robot URL is null or undefined.');

                        const formattedError = `Error: Robot URL is null or undefined.`;
                        setErrorMessage(formattedError);
                        setEnableDownloadPopUp(false);
                        setIsApiError(true);
                        return;
                    }

                    robotProperties = 
                        "leap.robot.host = " + robotUrl + "/execution/\n" +
                        "leap.robot.name = " + data.name + "\n" +
                        "leap.robot.working_dir = " + "." + "\n" +
                        "leap.robot.token = " + data.token;

                    robotName = data.name;
                } else {
                    log.info('Error: Data returned is null or undefined. API returned: ' + propertiesResponse.status);

                    const formattedError = `Error: Status: ${propertiesResponse.status}, Message: Robot Properties Unavailable.`;
                    setErrorMessage(formattedError);
                    setEnableDownloadPopUp(false);
                    setIsApiError(true);
                    return;
                }
            } else {
                const apiErrorText = await propertiesResponse.text();
                log.info('Error: API returned: ' + propertiesResponse.status + ' - ' + apiErrorText);

                const formattedError = `HTTP Error: Status: ${propertiesResponse.status}, Message: Error retrieving robot properties while creating zip.`;
                setErrorMessage(formattedError);
                setEnableDownloadPopUp(false);
                setIsApiError(true);
                return;
            }

            //STEP 3: Create a static batch file.
            const batchFile = 
                "pushd \"%~dp0\"\n" +
                "path = %JAVA_HOME%\\bin;%path%\n" +
                "start java -Drobot-prop=./robot.properties -jar leap-robot.jar"
            
            //STEP 4: Create a zip file with all the above files.
            const zip = new JSZip();

            zip.file("leap-robot.jar", javaJarFile);
            zip.file("robot.properties", robotProperties);
            zip.file("start.bat", batchFile);

            const zipBlob = await zip.generateAsync({ type: "blob" });

            //STEP 5: Download the zip file onto user's machine.
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            
            //Setting file name as robot name.
            link.download = robotName.trim() + ".zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch(error) {
            log.info('Error in downloadRobotDataOnClick function: ', error);

            setErrorMessage('Application Error: Error Creating Robot Zip.');
            setIsApiError(true);
        } finally {
            setEnableDownloadPopUp(false);
        }
    }

    return(
        <a href="#">
            <img
                src={DOWNLOAD_ICON}
                alt="Download Robot Properties"
                className={`${classes.downloadRobotIcon}`}
                onClick={() => downloadRobotDataOnClick(id)}
            />
        </a>
    );
};

export default DownloadRobot;