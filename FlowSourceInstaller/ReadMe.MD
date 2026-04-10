# FlowSource Installation

1. **FlowSourceInstaller Structure**  
```
FlowSourceInstaller
    |
    +--helm-chart/  
    +--terraform-scripts/  
    +--version/  
    +--install.sh  
    +--install.bat  
```

2. **FlowSource Image Creation and Push**  
   a. Below Files are used for FlowSource image creation and pushing the same into ACR/ECR/GAR repositores
   ```
   +--version/  
   +--install.sh  
   +--install.bat
   ```  
   b. Run the sh/bat file based on the host os to create a FlowSource Docker image based on the version present in version/version.txt  
   c. Input appropriate options while running the install.sh/install.bat file based on the target platform - AKS/EKS/GKE

3. **Deployment of FlowSource using Terraform and Helm**
     1. Create a folder under ```terraform-scripts``` called ```values-files```  
     2. ```values-files``` folder will be used for storing and referring below-mentioned files -  (more details in [point 4](#values-files))     
             - all-configurations.yaml  
             - app-config.yaml  
             - values.yaml  
     3. Update the values in ```flowsource-helm.aws.exampletfvars``` or ```flowsource-helm.aks.exampletfvars``` depending on target platform.  
        Also, ensure the `values-files` attribute in the tfvars file points to the correct paths of the required YAML files, including the `values.yaml` file.
     4. Update the `provider.tf` file by referring to the contents from `provider.tf.aks`, `provider.tf.eks` or `provider.tf.gke` depending on the type of the cluster
     5. After placing required files in ```values-files``` and filling the details in tfvar, execute the below commands  
          ```
          terraform init
          terraform plan -var-file "<path-to-flowsource-helm.aws.exampletfvars or flowsource-helm.aks.exampletfvars"
          terraform apply -var-file "<path-to-flowsource-helm.aws.exampletfvars or flowsource-helm.aks.exampletfvars"
          ```
     6. Above command will deploy flowsource into the target platform. 

<a id="values-files"></a>
4. **values-files**  
     <ol>
         <li>all-configurations.yaml: Make a copy/refer ```FlowSourceInstaller/helm-chart/docs/example-all-configurations.yaml``` or ```FlowSourceInstaller/helm-chart/docs/example-all-configurations-withrdsca.yaml.yaml```</li>  
          <li>values.yaml: Make a copy of/refer ```FlowSourceInstaller/helm-chart/docs/example-values.yaml```</li>  
          <li>app-config.yaml: Copy the contents of file - ```FlowSource-Package_<version>/configuration/app-config.yaml``` to a copy of ```FlowSourceInstaller/helm-chart/docs/example-app-config.yaml```</li>
          **Note**: Ensure the final copy of app-config.yaml has only one yaml property field - "appConfig", and contents of ```configurtion/app-config.yaml``` is value for this field.
     </ol>

5. **Tools and Access Required for GCP**  
```
     +--gcloud CLI
     +--Artifact Registry Writer - IAM permissions
     +--Docker or Podman
```