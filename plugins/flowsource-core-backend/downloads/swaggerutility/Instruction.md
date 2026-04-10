# Fetch OpenAPI Specification Script

This script fetches an OpenAPI specification from a given URL and saves it to a specified file. If the new specification differs from the existing file, it updates the file; otherwise, it indicates no changes were detected.

## Index

- [Fetch OpenAPI Specification Script](#fetch-openapi-specification-script)
  - [Index](#index)
  - [Prerequisites](#prerequisites)
  - [Usage](#usage)
    - [Batch Script (Windows)](#batch-script-windows)
    - [Shell Script (Unix-based systems)](#shell-script-unix-based-systems)
  - [Script Flow](#script-flow)
  - [Example](#example)
      - [Windows](#windows)
      - [Unix-based systems](#unix-based-systems)
  - [Notes](#notes)
  - [How to embed an OpenAPI Spec in a catalog-Info.yaml file](#how-to-embed-an-openapi-spec-in-a-catalog-infoyaml-file)

## Prerequisites

- Ensure `curl` is installed and available in your system’s PATH.
- Write permissions to the directory where the OpenAPI specification file will be saved.

## Usage

### Batch Script (Windows)

1. Save the batch script as `fetch_openapi_spec.bat`.
2. Open Command Prompt (cmd).
3. Navigate to the directory where your batch file is saved using the `cd` command. For example:
    ```
    cd C:\path\to\your\batch\file
    ```
4. Run the batch file with the required arguments:
    ```
    fetch_openapi_spec.bat <OPENAPI_URL> <SWAGGER_FILE_PATH>
    ```
    - `<OPENAPI_URL>`: The URL to fetch the OpenAPI specification.
    - `<SWAGGER_FILE_PATH>`: The path to save the OpenAPI specification as JSON.

### Shell Script (Unix-based systems)

1. Save the shell script as `fetch_openapi_spec.sh`.
2. Open Terminal.
3. Navigate to the directory where your shell file is saved using the `cd` command. For example:
    ```
    cd /path/to/your/shell/file
    ```
4. Run the shell script with the required arguments:
    ```
    ./fetch_openapi_spec.sh <OPENAPI_URL> <SWAGGER_FILE_PATH>
    ```
    - `<OPENAPI_URL>`: The URL to fetch the OpenAPI specification.
    - `<SWAGGER_FILE_PATH>`: The path to save the OpenAPI specification.

## Script Flow

- **Argument Check**: Verifies if the correct number of arguments is provided. If not, it displays usage instructions and exits.
- **Fetch OpenAPI Spec**: Uses `curl` to fetch the OpenAPI specification from the provided URL and saves it to a temporary file.
- **Error Handling**: If `curl` fails to fetch the specification, the script exits with an error message.
- **Check for Changes**: Compares the fetched specification with the existing file.
  - **No Change**: If no changes are found, it exits with the message “No change found.”
  - **Save the Spec**: If changes are found, it updates the OpenAPI specification file.

## Example

To fetch an OpenAPI spec from `https://api.example.com/openapi.json` and save it to `C:\api\swagger.yaml` (Windows) or `/path/to/swagger.yaml` (Unix-based systems), run:

#### Windows

```
fetch_openapi_spec.bat https://api.example.com/openapi.yaml C:\api\swagger.yaml
```

#### Unix-based systems

```
./fetch_openapi_spec.sh https://api.example.com/openapi.json /path/to/swagger.yaml
```

## Notes

- The script uses `curl` for fetching the OpenAPI spec. Ensure that `curl` is installed and available in your system’s PATH.

## How to embed an OpenAPI Spec in a catalog-Info.yaml file

To embed an OpenAPI spec file in a catalog-info.yaml file, use the `$ref` keyword to reference the external file. Here’s a basic example:

Sample OpenAPI spec file (e.g., openapi.yaml):
```yaml
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
paths:
  /pets:
    get:
      summary: List all pets
      responses:
        '200':
          description: A list of pets.
```

Reference the OpenAPI spec file in your catalog-info.yaml:
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-api
spec:
  type: service
  lifecycle: production
  owner: team-a
  definition:
    $text: './openapi.yaml'
```

This setup allows you to keep your OpenAPI specification in a separate file while referencing it in your catalog-info.yaml file, maintaining a clean and modular structure.