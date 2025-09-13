#!/bin/bash
echo "Building Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 -t sanderchernitsky/personal-homepage:latest --push .

echo "Triggering Render deploy..."
curl -X GET "https://api.render.com/deploy/srv-d1jshgndiees73cgi0kg?key=V9v4YPBu0V0"
