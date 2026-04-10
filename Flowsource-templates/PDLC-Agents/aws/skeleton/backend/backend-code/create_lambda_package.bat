@echo off

echo "Creating pdlc_assistant_deployment package...."

pip "install" "dist\multi_agent_system_aws-0.1.0-py3-none-any.whl" "-t" "%CD%\package"

COPY  "lambda_function.py"  "./package/"
COPY  "agent_config.json" "./package/"

cd "package"

DEL /S /Q "__pycache__" 
rmdir /S /Q "__pycache__"

DEL /S /Q "bin"
rmdir /S /Q "bin"

tar -cf "%CD%/../pdlc_assistant_deployment.zip" .