# Makefile for GitHub MCP Docker container

# Load .env file
include .env
export $(shell sed 's/=.*//' .env)

IMAGE_NAME=github-mcp-u
CONTAINER_NAME=github-mcp

.PHONY: build run stop remove stop-remove restart logs

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d --name $(CONTAINER_NAME) \
		--restart unless-stopped \
		-p $(PORT):7034 \
		--env-file .env \
		$(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME)

remove:
	docker rm $(CONTAINER_NAME)

stop-remove: stop remove

restart: stop-remove run

logs:
	docker logs -f $(CONTAINER_NAME)
