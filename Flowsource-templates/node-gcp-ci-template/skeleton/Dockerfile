# Use an official Node.js runtime as a parent image
FROM node:16-alpine AS build

# Install bash, unzip, and OpenJDK 11 JRE
RUN apk add --no-cache bash unzip openjdk11-jre

# Create a directory in the container
RUN mkdir -p /app

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json file into the container
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Create a non-root user and give it ownership of the application directory
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser && \
    chown -R appuser:appuser /app

# Create a directory for sonar-scanner and give the non-root user ownership of it
RUN mkdir -p /app/sonar-scanner && chown -R appuser:appuser /app/sonar-scanner

# Switch to the non-root user
USER appuser

# Expose a port if your application needs it
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]
