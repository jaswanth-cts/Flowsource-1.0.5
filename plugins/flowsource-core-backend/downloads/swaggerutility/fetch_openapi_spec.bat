@echo off

REM Check if the correct number of arguments is provided
if "%~2"=="" (
  echo Usage: %~nx0 ^<OPENAPI_URL^> ^<SWAGGER_FILE^>
  exit /b 1
)

REM URL to fetch the OpenAPI spec
set "OPENAPI_URL=%~1"
REM Path to the swagger.yaml file
set "SWAGGER_FILE=%~2"

REM Fetch the OpenAPI spec
echo Fetching OpenAPI spec from %OPENAPI_URL%...
curl -s %OPENAPI_URL% > temp.txt

if %errorlevel% neq 0 (
  echo Failed to fetch OpenAPI spec
  del temp.txt
  exit /b 1
)

REM Check if the fetched spec is different from the existing one
fc /b temp.txt "%SWAGGER_FILE%" > nul
if %errorlevel% equ 0 (
  echo No change found.
  del temp.txt
  exit /b 0
)

REM Save the response to swagger.yaml
move /y temp.txt "%SWAGGER_FILE%"

if %errorlevel% neq 0 (
  echo Failed to save OpenAPI spec to %SWAGGER_FILE%
  exit /b 1
)

echo OpenAPI spec saved successfully to %SWAGGER_FILE%.
