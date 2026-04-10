#!/bin/bash

echo "Creating pdlc_assistant_deployment package...."

pip install dist/multi_agent_system_aws-0.1.0-py3-none-any.whl -t ./package

cp lambda_function.py agent_config.json ./package/

cd package

rm -rf __pycache__ bin

zip -r ../pdlc_assistant_deployment.zip .