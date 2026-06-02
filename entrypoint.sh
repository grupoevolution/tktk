#!/bin/sh
mkdir -p /app/data
chown -R nextjs:nodejs /app/data 2>/dev/null || true
exec su-exec nextjs node server.js
