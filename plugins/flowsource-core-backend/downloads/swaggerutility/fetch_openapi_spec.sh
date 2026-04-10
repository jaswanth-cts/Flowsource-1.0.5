#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <OPENAPI_URL> <SWAGGER_FILE>"
  exit 1
fi

# URL to fetch the OpenAPI spec
OPENAPI_URL="$1"
# Path to the swagger.yaml file
SWAGGER_FILE="$2"

# Fetch the OpenAPI spec
echo "Fetching OpenAPI spec from $OPENAPI_URL..."
response=$(curl -s "$OPENAPI_URL")

if [ $? -ne 0 ]; then
  echo "Failed to fetch OpenAPI spec"
  exit 1
fi

# Check if the fetched spec is different from the existing one
if cmp -s <(echo "$response") "$SWAGGER_FILE"; then
  echo "No change found."
  exit 0
fi

# Save the response to swagger.yaml
echo "$response" > "$SWAGGER_FILE"

if [ $? -ne 0 ]; then
  echo "Failed to save OpenAPI spec to $SWAGGER_FILE"
  exit 1
fi

echo "OpenAPI spec saved successfully to $SWAGGER_FILE."
