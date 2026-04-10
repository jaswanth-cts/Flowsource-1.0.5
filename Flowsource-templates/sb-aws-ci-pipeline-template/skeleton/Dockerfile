# Use the Corretto image as a base image
FROM public.ecr.aws/amazoncorretto/amazoncorretto:17.0.11-al2-native-jdk

ENV APP_NAME ${{values.artifact_id}}

# Create the app directory
RUN mkdir -p /opt/$APP_NAME

# Set the working directory
WORKDIR /opt/$APP_NAME

# Copy the built JAR from the build stage
COPY build_output/${{values.artifact_id}}.jar /opt/$APP_NAME/${{values.artifact_id}}.jar

# Expose port 8080
EXPOSE 8080

# Command to run your application
ENTRYPOINT ["java","-jar","${{values.artifact_id}}.jar"]
