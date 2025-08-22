#!/bin/bash

# Frontend deployment script
set -e

ENVIRONMENT=${1:-dev}
CHART_NAME="frontend-chart"
RELEASE_NAME="frontend-app"
NAMESPACE="default"

echo "Deploying frontend to $ENVIRONMENT environment..."

# Check if Helm chart exists
if [ ! -d "$CHART_NAME" ]; then
    echo "Error: Helm chart directory '$CHART_NAME' not found"
    exit 1
fi

# Check if values file exists
VALUES_FILE="$CHART_NAME/values/$ENVIRONMENT.yaml"
if [ ! -f "$VALUES_FILE" ]; then
    echo "Error: Values file '$VALUES_FILE' not found"
    exit 1
fi

# Deploy with Helm
helm upgrade --install \
    $RELEASE_NAME-$ENVIRONMENT \
    ./$CHART_NAME \
    --values $VALUES_FILE \
    --namespace $NAMESPACE \
    --create-namespace \
    --wait \
    --timeout 300s

echo "Deployment completed successfully!"

# Display deployment status
echo "Getting deployment status..."
kubectl get pods -l app=$CHART_NAME,environment=$ENVIRONMENT -n $NAMESPACE
kubectl get svc -l app=$CHART_NAME,environment=$ENVIRONMENT -n $NAMESPACE