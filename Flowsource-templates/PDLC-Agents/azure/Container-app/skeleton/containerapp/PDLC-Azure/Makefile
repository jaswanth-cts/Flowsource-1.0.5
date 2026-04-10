# Makefile for building and running the multi-agent chat app

APP_NAME = pdlc-azure-dev-v2
IMAGE_NAME = $(APP_NAME)
CONTAINER_NAME = $(APP_NAME)
PORT = 7036

.PHONY: build run stop logs restart clean

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the container
run:
	docker run -d --name $(CONTAINER_NAME) \
		--restart unless-stopped \
		-p $(PORT):7036 \
		$(IMAGE_NAME)

# Stop the container
stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# Show logs
logs:
	docker logs -f $(CONTAINER_NAME)

# Restart container
restart: stop run

# Remove image and container
clean: stop
	docker rmi $(IMAGE_NAME) || true

