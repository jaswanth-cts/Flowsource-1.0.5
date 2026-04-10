# Makefile for Jira MCP Docker container

# Load variables from .env if it exists
ifneq (,$(wildcard .env))
include .env
export $(shell sed 's/=.*//' .env)
endif

IMAGE_NAME=jira-mcp-u
CONTAINER_NAME=jira-mcp

.PHONY: build run stop remove stop-remove restart logs

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d --name $(CONTAINER_NAME) \
		--restart unless-stopped \
		-p $(PORT):7035 \
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
