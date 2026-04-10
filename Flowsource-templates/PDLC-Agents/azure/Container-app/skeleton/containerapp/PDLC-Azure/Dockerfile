# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV APP_HOME=/app
ENV HOST=0.0.0.0
ENV PORT=7036

# Set the working directory in the container
WORKDIR "$APP_HOME"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-deps -r requirements.txt

# Copy the application code
COPY . .

# Copy entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Add a non-root user and switch to it
RUN useradd -m appuser && chown -R appuser "$APP_HOME" /entrypoint.sh
USER appuser

# Expose the port
EXPOSE $PORT

# Use entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
