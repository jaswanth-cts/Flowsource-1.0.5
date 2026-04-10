#Use an official Node.js runtime as a parent image
FROM node:18.20.2-alpine3.18

# Set working directory
WORKDIR /app

#Copy package.json to the container
COPY package.json /app/package.json

#Install Dependencies
RUN npm install

#Copy the rest of the application code to the container
COPY . /app

# Create a non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser
    
# Change the ownership of the application files to the non-root user
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

EXPOSE 3000
CMD ["npm", "start"]
