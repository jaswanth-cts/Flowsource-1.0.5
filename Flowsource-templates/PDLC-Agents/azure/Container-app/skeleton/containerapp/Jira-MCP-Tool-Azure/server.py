#server.py
import os
import sys
import logging
from dotenv import load_dotenv
from fastmcp import FastMCP
from fastmcp.server.auth import BearerAuthProvider
from tools import register_tools

# Load environment variables from .env
load_dotenv()

# Load public key from environment
# public_key_pem = inspect.cleandoc(os.getenv("PUBLIC_KEY", ""))

#from docker
# public_key_env = os.getenv("PUBLIC_KEY", "")
# public_key_pem = public_key_env.encode("utf-8").decode("unicode_escape")

# Configure bearer token authentication
# auth = BearerAuthProvider(
#     public_key=public_key_pem,
#     issuer=os.getenv("JWT_ISSUER"),
#     audience=os.getenv("JWT_AUDIENCE")
# )

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jira-mcp-server")

def get_port():
    try:
        return int(os.getenv("PORT", 7035))
    except ValueError:
        logger.error("Invalid PORT specified in environment.")
        sys.exit(1)

def main():
    mcp = FastMCP(name="jira-mcp-server")
    logger.info("Registering tools...")
    register_tools(mcp)

    port = get_port()
    logger.info(f"Starting MCP server on port {port}...")

    # Run the server
    try:
        mcp.run(
            transport="streamable-http",
            host="0.0.0.0",
            port=port
        )
    except Exception:
        logger.exception("Failed to start MCP server:")
        sys.exit(1)

if __name__ == "__main__":
    main()

