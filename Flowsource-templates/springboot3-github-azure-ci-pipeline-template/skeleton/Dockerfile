# Use the Eclipse Temurin 17 JRE Alpine image as a base image
FROM eclipse-temurin:17-jre-alpine as base

# Expose port for the application
EXPOSE 8080

# Install curl, bash, and netcat, download the OpenTelemetry Java agent, and clean up in a single RUN command
RUN apk add --no-cache curl bash netcat-openbsd && \
    mkdir -p /home/otel && \
    curl -Lo /home/otel/opentelemetry-javaagent.jar https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.6.0/opentelemetry-javaagent.jar && \
    apk del curl && \
    rm -rf /var/cache/apk/*

# Add the application JAR file to the container
COPY target/${{values.artifact_id}}.jar /home/otel/${{values.artifact_id}}.jar

# Copy the start.sh script into the container and make it executable
COPY start.sh /opt/start.sh
RUN chmod +x /opt/start.sh

# Create a non-root user and change ownership of the application files
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser && \
    chown -R appuser:appuser /home/otel /opt/start.sh

# Switch to the non-root user
USER appuser

# Use the official OpenTelemetry Collector image
FROM otel/opentelemetry-collector-contrib:latest as otelcol

# Combine both stages
FROM base

# Copy the OpenTelemetry Collector binary and configuration file
COPY --from=otelcol /otelcol-contrib /otelcol-contrib
COPY src/main/resources/otelcol-config.yaml /etc/otelcol-config.yml

# Use the start.sh script as the entry point
ENTRYPOINT ["/opt/start.sh"]
