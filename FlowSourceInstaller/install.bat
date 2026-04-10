@echo off

setlocal enabledelayedexpansion

GOTO :MAIN

:chooseCloudService
    echo Please select a cloud service for deployment.
    echo 1. AWS (uses ECR and EKS)
    echo 2. Azure (uses ACR and AKS)
    echo 3. GCP (uses GAR and GKE)
    set /p "ID=Please enter the selected option (numerical) : "
    echo ====================================================================
    echo:
    
    IF "!ID!"=="1" (
        
        echo You have selected AWS^^!
        echo:
        call:ecrLogin || EXIT /B 1
        
    ) ELSE IF "!ID!"=="2" (

        echo You have selected Azure^^!
        echo:
        call:azureLogin || EXIT /B 1
       
    ) ELSE IF "!ID!"=="3" (

        echo You have selected GCP^^!
        echo:
        call:gcpLogin || EXIT /B 1    
    ) ELSE (
        echo Invalid response.
        EXIT /B 1
    )
GOTO:EOF

:ecrLogin
    set /p "accountId= Please enter your AWS Account ID: " 
    set /p "region= Please enter your AWS ECR Region: " 
    set /p  "ecrRepName= Please enter AWS ECR Repository name: "
   
    set "registryUrl=!accountId!.dkr.ecr.!region!.amazonaws.com/!ecrRepName!"

    FOR /F "tokens=*" %%g IN ('"aws ecr get-login-password --region %region% 2>&1 | docker login --username AWS --password-stdin %accountId%.dkr.ecr.%region%.amazonaws.com 2>&1"') do (SET loginRes=%%g)

    IF /I "%loginRes%" EQU "Login Succeeded" (
        echo:
        echo ECR Login Successful^^!   
    ) ELSE (
        echo:
        echo ECR Login Failed
        echo %loginRes%
        EXIT /B 1
    )
GOTO:EOF

:azureLogin
    set /p "azRegName=Please enter your Azure ACR Name (eg: for <abcd>@azurecr.io enter <abcd>): "
    set /p "azRepoName=Please enter your Azure Repository name: "

    set "registryUrl=!azRegName!/!azRepoName!"

    FOR /F "tokens=*" %%g IN ('"az acr login --name %azRegName% 2>&1"') do (SET azLoginRes=%%g)

    IF /I "%azLoginRes%" EQU "Login Succeeded" (
        echo:
        echo ACR Login Successful^^!   
    ) ELSE (
        echo:
        echo ACR Login Failed
        echo %azLoginRes%
        EXIT /B 1
    )
GOTO:EOF

:gcpLogin
    set /p "gcpLocation=Please enter your GCP Location (eg: us-east-1/): "
    set /p "gcpProjectId=Please enter your GCP Project ID: "
    set /p "gcpRepositoryName=Please enter your GCP Repository Name: "
    set /p "gcpImageName=Please enter your GCP Image Name: "
    set "registryUrl=!gcpLocation!-docker.pkg.dev/!gcpProjectId!/!gcpRepositoryName!/!gcpImageName!"
    echo:
    echo RegistryURL: %registryUrl%
    echo Checking GAR Access...
    FOR /F "tokens=*" %%g IN ('"gcloud auth configure-docker  %gcpLocation%-docker.pkg.dev 2>&1"') do (SET gcpLoginRes=%%g)
    IF /I "%gcpLoginRes%"  EQU "Docker configuration file updated." (
        echo:
        echo Google Artifact Registry Login Successful^^!   
    ) ELSE IF /I "%gcpLoginRes%"  EQU "gcloud credential helpers already registered correctly." (
        echo:
        echo Google Artifact Registry Login Successful^^!   
    ) ELSE (
        echo:
        echo Google Artifact Registry Login Failed
        echo %gcpLoginRes%
        EXIT /B 1
    )
GOTO:EOF

:getTimeStamp
    for /f "usebackq delims=" %%a in (`powershell -Command "Get-Date -Format 'yyyy-MM-dd-HH-mm-ss'"`) do set "timeStamp=%%a"
GOTO:EOF

:loadTagAndPushImage
    
    set "versionFile=./version/version.txt"
    
    FOR /F "tokens=*" %%g IN (!versionFile!) do (SET image=%%g)
    set image=%image: =%
    FOR /F "tokens=2,3 delims=: " %%a in ("%image%") do (
        set imageName=%%a
        set imageTag=%%b
    )

    echo Please provide the complete path of the dockerFile present in the core flowsource directory ^(ex^: D^:\path_to_flowsource^)
    set /p "dockerFilePath=Enter Path: "

    echo:
    echo This step will take sometime, Building the image now...
    if not exist "./logs" (
        md "logs" 2>NUL
    )    
    call:getTimeStamp
    set "logFile=./logs/dockerBuild_!timeStamp!.log"

    (docker build -t !imageName!:!imageTag! !dockerFilePath! ) > !logFile! 2>&1

    if !errorlevel! NEQ 0 (
        echo The docker build command has failed. Please check logs/dockerBuild_!timeStamp!.log file for more info.
        EXIT /B 1
    )
    
    echo Tagging the image now...
    docker tag !imageName!:!imageTag! !registryUrl!:!imageTag!
    
    echo Pushing image to the repository now...
    docker push !registryUrl!:!imageTag!

    if !errorlevel! NEQ 0 (
        EXIT /B 1
    )
    
    echo:
    echo Image has been pushed to the below repository^^!
    echo !registryUrl!:!imageTag!
GOTO:EOF


:checkForPreRequisites
    
    set /p "propInst= If pre-requisites are set, please confirm if we can proceed with the installation [Y/N] : "

    IF /I "%propInst%" EQU "Y" (
        echo Proceeding with the installation...   
    ) ELSE IF /I "%propInst%" EQU "N" (
        echo Please complete the pre-requisites before proceeding.
        EXIT /B 1
    ) ELSE (
        echo Invalid response.
        EXIT /B 1
    )
GOTO:EOF




:MAIN

    echo   ______ _                _____                          
    echo  ^|  ____^| ^|              / ____^|                        
    echo  ^| ^|__  ^| ^| _____      _^| (___   ___  _   _ _ __ ___ ___ 
    echo  ^|  __^| ^| ^|/ _ \ \ /\ / /\___ \ / _ \^| ^| ^| ^| '__/ __/ _ \
    echo  ^| ^|    ^| ^| (_) \ V  V / ____) ^| (_) ^| ^|_^| ^| ^| ^| (_^|  __/
    echo  ^|_^|    ^|_^|\___/ \_/\_/ ^|_____/ \___/ \__,_^|_^|  \___\___^| INSTALLER
    echo ===================================================================
    echo PRE-REQUISITES:-
    echo 1. Docker, Kubectl, Terraform and Helm are mandatory
    echo 2. Please mention the correct details of the flowsource chart in the terraform's .tfvar file
    echo 3. Please fill in the credentials for the RDS instance you will be using, in "\{values-file}\values.yaml."
    echo  * Please mention the passowrd in "POSTGRES_PASSWORD",
    echo    the RDS-URL and USERID in "POSTGRES_SERVICE_HOST" and "POSTGRES_USER" respectively.
    echo  * To establish an SSL connection with the DB, place the content of your .pem file in "\{values-file}\all-configurations.yaml"
    echo    under "name: flowsource-rds-certificate.pem" as part of content.
    echo 4. Please set up your AWS(ECR and EKS) or Azure(ACR and AKS) or GCP(GAR and GKE) configuration as applicable to you.
    echo 5. Please create a working Dockerfile and place it in the root directory of the flowsource application.
    echo ====================================================================
    echo:

    call:checkForPreRequisites || EXIT /B 1
    
    echo ====================================================================
    echo:
    
    call:chooseCloudService || EXIT /B 1

    echo ====================================================================
    echo:
    
    call:loadTagAndPushImage || EXIT /B 1

GOTO:EOF