#!/bin/sh
exec gunicorn multi_agent_chat.main:app \
    -k uvicorn.workers.UvicornWorker \
    --bind "${HOST}:${PORT}" \
    --workers 2 \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance
