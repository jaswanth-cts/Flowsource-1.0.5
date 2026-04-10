# Use the Corretto image as a base image
FROM public.ecr.aws/amazoncorretto/amazoncorretto:17.0.11-al2-native-jdk as base
# Set an environment variable for the application name
ENV APP_NAME ${{values.artifact_id}}
# Create directories, install curl, bash, and netcat, download OpenTelemetry Java agent, remove curl, clean yum caches
RUN mkdir -p /opt/$APP_NAME && \
    mkdir -p /home/otel && \
    yum install -y curl bash nc && \
    curl -Lo /home/otel/opentelemetry-javaagent.jar https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.6.0/opentelemetry-javaagent.jar && \
    rpm -e --nodeps curl && yum clean all
# Set the working directory to the application directory
WORKDIR /opt/$APP_NAME
# Copy the built JAR from the build stage
COPY build_output/${{values.artifact_id}}.jar /opt/$APP_NAME/${{values.artifact_id}}.jar
# Expose port 8080
EXPOSE 8080
# Use the Amazon OpenTelemetry Collector image
FROM public.ecr.aws/aws-observability/aws-otel-collector:latest as otelcol
# Combine both stages
FROM base
# Copy the OpenTelemetry Collector binary and configuration file
COPY --from=otelcol /awscollector /otelcol
COPY src/main/resources/otelcol-config.yaml /etc/otelcol-config.yml
# Copy the start.sh script into the container
COPY start.sh /opt/start.sh
# Make the start.sh script executable
RUN chmod +x /opt/start.sh
# Use the start.sh script as the entry point
ENTRYPOINT ["/opt/start.sh"]
