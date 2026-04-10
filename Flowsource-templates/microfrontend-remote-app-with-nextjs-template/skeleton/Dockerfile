# Use the official Node.js image as a base image
FROM public.ecr.aws/docker/library/node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json yarn.lock ./

# Copy the built application code
COPY out ./out

# Create a non-root user
RUN addgroup -g 1001 -S webappgroup && \
    adduser -u 1001 -S appuser -G webappgroup

# Change the ownership of the application files to the non-root user
RUN chown -R appuser:webappgroup /app

# Switch to the non-root user
USER appuser

# Expose port 3001 (or adjust to your application's port)
EXPOSE 3001

# Start the application
CMD ["yarn", "serve"]
