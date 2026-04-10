#!/usr/bin/env python3
import os
import sys
import logging
from dotenv import load_dotenv
from fastmcp import FastMCP
from tools import register_tools

# Load environment variables from .env
load_dotenv()

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("github-mcp-server")

def get_port():
    try:
        return int(os.getenv("PORT", 7034))
    except ValueError:
        logger.error("Invalid PORT specified in environment.")
        sys.exit(1)

def main():
    mcp = FastMCP(name="github-mcp-server")
    logger.info("Registering tools...")
    register_tools(mcp)

    port = get_port()
    logger.info(f"Starting MCP server on port {port}...")

    # Run the server
    try:
        mcp.run(
            transport="sse",
            host="0.0.0.0",
            port=port
        )
    except Exception:
        logger.exception("Failed to start MCP server:")
        sys.exit(1)

if __name__ == "__main__":
    main()

