# Use a minimal Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    APP_HOME=/app \
    HOST=0.0.0.0 \
    PORT=7035

# Set work directory
WORKDIR ${APP_HOME}

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Create a non-root user to run the app
RUN useradd -m appuser && chown -R appuser ${APP_HOME}
USER appuser

# Expose the port
EXPOSE $PORT

# Run the app (keep logging clean for Docker)
CMD ["python", "server.py"]

