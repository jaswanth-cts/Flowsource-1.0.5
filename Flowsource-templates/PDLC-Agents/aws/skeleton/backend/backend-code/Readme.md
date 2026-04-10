# **Flowsource-PDLC-Bot**
Repository for PDLC Backend Template.

## Build Instructions

**_Before executing the below script, make sure that python is installed and pip command works fine_**

1. execute the `create_lambda_package.(sh/bat)` to build the deployment package for the lambda function.

2. **Verify that the deployment package (pdlc_assistant_deployment.zip) includes the following files:**

   - `lambda_function.py`
   - `agent_config.json`
   - Installed Python libraries and dependency packages