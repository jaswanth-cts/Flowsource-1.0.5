#!/bin/bash

# Start the OpenTelemetry Collector in the background
/otelcol --config=/etc/otelcol-config.yml &

# Loop until the OpenTelemetry Collector ports are open
while ! nc -z localhost 4317 || ! nc -z localhost 4318; do
  echo 'Waiting for OpenTelemetry Collector to start...'
  sleep 1
done

echo 'OpenTelemetry Collector is up and running.'

# Start the Java application with the OpenTelemetry Java agent
java -javaagent:/home/otel/opentelemetry-javaagent.jar -jar /opt/$APP_NAME/${{values.artifact_id}}.jar
