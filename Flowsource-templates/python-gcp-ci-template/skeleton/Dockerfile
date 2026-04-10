#Use an official python runtime as a parent image
FROM python:3.9.13

#Create a directory in the container
RUN mkdir -p /app

#Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Expose a port if your application needs it
EXPOSE 8000

# Define the command to run your application with uvicorn
CMD ["uvicorn", "app.controller.main:app", "--host", "0.0.0.0", "--port", "8000"]
