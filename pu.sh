#!/bin/bash
echo "Building Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 -t sanderchernitsky/personal-homepage:latest --push .

echo "Triggering Render deploy..."
# You'll need to replace this with your actual Render service deploy hook
echo "Please update the deploy hook URL after creating the service on Render"
# curl -X GET "https://api.render.com/deploy/srv-YOUR_SERVICE_ID?key=YOUR_DEPLOY_KEY"
