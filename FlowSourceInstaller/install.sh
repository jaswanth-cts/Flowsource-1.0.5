#!/bin/bash

cloud_selection_prompt() {
    echo "Please select the cloud used for deployment. "
    echo "1. AWS (uses ECR and EKS)"
    echo "2. Azure (uses ACR and AKS)"
    echo "3. GCP (uses GAR and GKE)"
    read -p "Please enter the selected option (numerical) : " cloud_input
    echo ====================================================================
    echo

    case $cloud_input in
    [1])
        echo "AWS has been selected!"
        echo
        getAWSDetails
        checkECRLogin
        ;;
    [2])
        echo "Azure has been selected!"
        echo
        yes_no_prompt "Please confirm az login is completed [Yes/No] : "
        getAzureDetails
        checkACRLogin
        ;;
    [3])
        echo "GCP has been selected!"
        echo
        getGCPDetails
        checkGARLogin
        ;;
    *)
        echo "Invalid response."
        exit 0
        ;;
    esac
}
getAWSDetails() {
    echo "Please enter AWS Account ID"
    read aws_account_id
    echo "Please enter AWS ECR Region"
    read aws_region
    echo "Please enter AWS ECR Repository name"
    read aws_repo_name
    registry_url=$aws_account_id.dkr.ecr.$aws_region.amazonaws.com/$aws_repo_name
}
getAzureDetails() {
    echo "Please enter ACR name eg: <abcd>@azurecr.io"
    read azure_registry
    echo "Please enter Azure Repository name"
    read azure_repo_name
    registry_url=$azure_registry/$azure_repo_name
}
getGCPDetails() {
    echo "Please enter GCP GAR Region eg: us-east1:"
    read gcp_region
    echo "Please enter GCP Project ID:"
    read gcp_project_name
    echo "Please enter GCP GAR Repository name:"
    read gcp_repo_name
    echo "Please enter Image Name eg: flowsource-demo:"
    read gcp_image_name
    registry_url=$gcp_region-docker.pkg.dev/$gcp_project_name/$gcp_repo_name/$gcp_image_name
}
checkECRLogin() {
    echo
    echo "Checking ECR Access..."
    echo

    log_file="./logs/ecrlogin_$(date +%Y%m%d_%H%M%S).log"
    logs_dir="logs"
    if [ ! -d "$logs_dir" ]; then       
        mkdir "$logs_dir"
    fi
    (aws ecr get-login-password --region $aws_region | docker login --username AWS --password-stdin $aws_account_id.dkr.ecr.$aws_region.amazonaws.com) > $log_file 2>&1

    if [ $? -eq 0 ]; then
        echo "ECR login successful"
    else
        echo "ECR login failed. Please check $log_file file for more info."
        exit 1 # Return false
    fi
}
checkACRLogin() {
    echo
    echo "Checking ACR Access..."
    echo

    log_file="./logs/acrlogin_$(date +%Y%m%d_%H%M%S).log"
    logs_dir="logs"
    if [ ! -d "$logs_dir" ]; then       
        mkdir "$logs_dir"
    fi
    (az acr login --name $azure_registry) > $log_file 2>&1    

    if [ $? -eq 0 ]; then
        echo "ACR login successful"
    else
        echo "ACR login failed. Please check $log_file file for more info." 
        exit 1 # Return false
    fi
}
checkGARLogin() {
    echo
    echo "Checking GAR Access..."
    echo

    log_file="./logs/garlogin_$(date +%Y%m%d_%H%M%S).log"
    logs_dir="logs"
    if [ ! -d "$logs_dir" ]; then       
        mkdir "$logs_dir"
    fi
    (gcloud auth configure-docker $gcp_region-docker.pkg.dev) > $log_file 2>&1
    
    if [ $? -eq 0 ]; then
        echo "GAR login successful"
    else
        echo "GAR login failed. Please check $log_file file for more info."
        exit 1 # Return false
    fi
}
loadTagAndPushImage() {
    version_file="./version/version.txt"

    IMAGE_NAME=$(cat $version_file | sed -e 's/[ ",]/''/g' | grep "^image" | awk -F: '{print $2}')
    IMAGE_TAG=$(cat $version_file | sed -e 's/[ ",]/''/g' | grep "^image" | awk -F: '{print $3}')

    echo "Registry URL is " : $registry_url

    echo
    echo "Please provide the complete path of the dockerFile present in the core flowsource directory (ex: /path_to_flowsource)"
    read -p "Enter Path: " dockerFilePath

    log_file="./logs/dockerBuild_$(date +%Y%m%d_%H%M%S).log"

    echo
    echo "This step will take sometime, Building the image now..."

    docker build -t $IMAGE_NAME:$IMAGE_TAG $dockerFilePath > $log_file 2>&1

    if [ $? -ne 0 ]; then
        echo "The docker build command has failed. Please check $log_file file for more info."
        exit 1
    fi

    echo "Tagging the image now..."
    docker tag $IMAGE_NAME:$IMAGE_TAG $registry_url:$IMAGE_TAG

    echo "Pushing image to the repository now..."
    docker push $registry_url:$IMAGE_TAG

    if [ $? -ne 0 ]; then
        exit 1
    fi

    echo
    echo "Image has been pushed to the below repository!"
    echo "$registry_url:$IMAGE_TAG"
}

yes_no_prompt() {
    read -p "$1" yes_no_input
    case $yes_no_input in
    [yY][eE][sS] | [yY]) echo "$2" ;;
    [nN][oO] | [nN])
        echo "Skipping Installation"
        exit 0
        ;;
    *)
        echo "Invalid response."
        exit 0
        ;;
    esac
}


checkForPreRequisites() {
    echo "  ______ _                _____  "                         
    echo " |  ____| |              / ____| "                       
    echo " | |__  | | _____      _| (___   ___  _   _ _ __ ___ ___ "
    echo " |  __| | |/ _ \ \ /\ / /\___ \ / _ \| | | | '__/ __/ _ \\"
    echo " | |    | | (_) \ V  V / ____) | (_) | |_| | | | (_|  __/"
    echo " |_|    |_|\___/ \_/\_/ |_____/ \___/ \__,_|_|  \___\___| INSTALLER"
    echo "==================================================================="
    echo "PRE-REQUISITES:-"
    echo "1. Docker, Kubectl, Terraform and Helm are mandatory"
    echo "2. Please mention the correct details of the flowsource chart in the terraform's .tfvar file"
    echo "3. Please fill in the credentials for the RDS instance you will be using, in \"\{values-file}\values.yaml.\""
    echo " * Please mention the passowrd in \"POSTGRES_PASSWORD\","
    echo "   the RDS-URL and USERID in \"POSTGRES_SERVICE_HOST\" and \"POSTGRES_USER\" respectively."
    echo " * To establish an SSL connection with the DB, place the content of your .pem file in \"\{values-file}\all-configurations.yaml\""
    echo "   under \"name: flowsource-rds-certificate.pem\" as part of content."
    echo "4. Please set up your AWS(ECR and EKS) or Azure(ACR and AKS) or GCP(GAR and GKE) configuration as applicable to you."
    echo "5. Please create a working Dockerfile and place it in the root directory of the flowsource application."
    echo "==================================================================="
    echo
    yes_no_prompt "If pre-requisites are set, please confirm if we can proceed with the installation [Yes/No] : " "Proceeding with the installation..."
}

checkForPreRequisites

echo ====================================================================
echo

cloud_selection_prompt

echo ====================================================================
echo

loadTagAndPushImage
