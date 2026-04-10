# QuickStart Blueprint - Node - No Database - NestJs
 
A Node- No Database NestJs application.

- [Getting Started](#getting-started)

  - [Prerequisites](#prerequisites)

  - [Local Installation](#local-installation)

- [API Endpoints](#api-endpoints)

- [Docker Installation](#run-dockerized-version-of-the-app)

- [Security Scans](#run-checkmarx-&-sonar-scan)

## Getting Started

### Prerequisites


- Node 16 or latest version

### Local Installation

- Local Setup
  - Clone this repo.
  - (Optional) Create a virtual environment and activate it:
   ```bash

  - Install dependencies:
   ```bash

   npm install

   ```
  - Add new file in the root folder as `.env` and copy variables from .env.example.

  - To run the application in local
  ```

  npm run

  ``` 
  - You will be able to access the api from http://localhost:3000/
  - To run test case in local

  ```
   npm test

    ``` 

## API Endpoints

- `/hello`: [GET] - Print Hello World.

## Run dockerized version of the app


1. **Build the Docker Image:**

   Open a terminal and navigate to your project directory containing the `Dockerfile` and run:

   ```bash

   docker build -t nestjs-app .

   ```

   This command will build a Docker image named `nestjs-app` based on your `Dockerfile`.

2. **Run the Docker Container:**

   Once the image is built, you can run the Docker container:

   ```bash

   docker run -p 3000:3000 nestjs-app

   ```

3. **Access Your Application:**

   Your Dockerized NestJs application should now be running. You can access it in your web browser or via `http://localhost:3000`

## Run Checkmarx & Sonar Scan

Branch starting with the name /sast and /sonar will perform Checkmarx & Sonar Scan.

- Start the branch name with 'sast' to initiate Checkmarx Scan.

```
- /sast\/.*/          # eg: sast/1, sast/prod
```

- Start the branch name with 'sonar' to initiate Sonar Scan.

```
- /sonar\/.*/          # eg: sonar/1, sonar/prod
```