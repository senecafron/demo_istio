# 🚀 Complete Deployment Guide for Next.js Todo App

## Overview
This guide will help you deploy your Next.js todo app to a Kubernetes cluster and make it accessible at `demo_istio_frontend.dev.fronseneca.dev`.

## Prerequisites
- Docker installed on your machine
- Access to a Kubernetes cluster (local or cloud)
- kubectl configured to access your cluster
- Helm 3 installed
- Domain control for DNS configuration

## Step 1: Build and Push Docker Image

### Option A: Using Docker Hub (Free)
```bash
# 1. Create a Docker Hub account at https://hub.docker.com

# 2. Login to Docker Hub
docker login

# 3. Tag your image with your Docker Hub username
docker tag frontend-todo-app:dev YOUR_DOCKERHUB_USERNAME/frontend-todo-app:dev

# 4. Push the image
docker push YOUR_DOCKERHUB_USERNAME/frontend-todo-app:dev
```

### Option B: Using a Private Registry
```bash
# For AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_REGISTRY_URL
docker tag frontend-todo-app:dev YOUR_REGISTRY_URL/frontend-todo-app:dev
docker push YOUR_REGISTRY_URL/frontend-todo-app:dev

# For Google Container Registry
gcloud auth configure-docker
docker tag frontend-todo-app:dev gcr.io/YOUR_PROJECT/frontend-todo-app:dev
docker push gcr.io/YOUR_PROJECT/frontend-todo-app:dev
```

## Step 2: Update Helm Values with Your Image

Edit `helm/frontend-chart/values/dev.yaml`:
```yaml
image:
  repository: YOUR_DOCKERHUB_USERNAME/frontend-todo-app  # Update this!
  pullPolicy: IfNotPresent
  tag: "dev"
```

## Step 3: Deploy to Kubernetes

### Check your cluster is ready:
```bash
# Verify kubectl is connected
kubectl cluster-info

# Check nodes are ready
kubectl get nodes
```

### Deploy with Helm:
```bash
cd helm

# Deploy the application
helm upgrade --install \
  frontend-app-dev \
  ./frontend-chart \
  --values ./frontend-chart/values/dev.yaml \
  --namespace dev \
  --create-namespace

# Check deployment status
kubectl get pods -n dev
kubectl get svc -n dev
kubectl get ingress -n dev
```

## Step 4: Configure DNS

### Add DNS A Record:
1. Go to your DNS provider (Cloudflare, Route53, etc.)
2. Add an A record:
   - Name: `demo_istio_frontend.dev`
   - Type: A
   - Value: Your Kubernetes cluster's external IP
   - TTL: 300 (5 minutes)

### Find your cluster's external IP:
```bash
# For cloud providers with LoadBalancer
kubectl get ingress -n dev

# Look for the EXTERNAL-IP or ADDRESS column
```

## Step 5: Install Ingress Controller (if not installed)

### For NGINX Ingress:
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

### For Istio (since you're using demo_istio):
```bash
# Install Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo -y

# Label namespace for Istio injection
kubectl label namespace dev istio-injection=enabled
```

## Step 6: Set up SSL/TLS (Optional but Recommended)

### Install cert-manager for automatic SSL:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## Step 7: Verify Deployment

### Check all resources are running:
```bash
# Check pods
kubectl get pods -n dev
# Should show: frontend-chart-dev-xxxxx  1/1  Running

# Check service
kubectl get svc -n dev
# Should show: frontend-chart-service-dev  ClusterIP  10.x.x.x  <none>  3000/TCP

# Check ingress
kubectl get ingress -n dev
# Should show your domain with an IP address

# Check logs if needed
kubectl logs -n dev -l app=frontend-chart --tail=50
```

### Test locally first:
```bash
# Port forward to test without domain
kubectl port-forward -n dev svc/frontend-chart-service-dev 3000:3000

# Open browser to http://localhost:3000
```

## Step 8: Access Your Application

Once DNS propagates (5-30 minutes), you can access:
- HTTP: http://demo_istio_frontend.dev.fronseneca.dev
- HTTPS: https://demo_istio_frontend.dev.fronseneca.dev (if SSL configured)

## Troubleshooting

### Pod not starting:
```bash
kubectl describe pod -n dev frontend-chart-dev-xxxxx
kubectl logs -n dev frontend-chart-dev-xxxxx
```

### Ingress not getting IP:
```bash
kubectl describe ingress -n dev
kubectl get events -n dev
```

### DNS not resolving:
```bash
# Check DNS propagation
nslookup demo_istio_frontend.dev.fronseneca.dev
dig demo_istio_frontend.dev.fronseneca.dev
```

### Environment variables not working:
```bash
# Check ConfigMap
kubectl get configmap -n dev
kubectl describe configmap frontend-chart-config-dev -n dev

# Check env vars in pod
kubectl exec -n dev frontend-chart-dev-xxxxx -- env | grep NEXT_PUBLIC
```

## Updating the Application

When you make code changes:
```bash
# 1. Build new image
docker build -t YOUR_DOCKERHUB_USERNAME/frontend-todo-app:dev-v2 .

# 2. Push new image
docker push YOUR_DOCKERHUB_USERNAME/frontend-todo-app:dev-v2

# 3. Update Helm values (change tag to dev-v2)

# 4. Upgrade deployment
helm upgrade frontend-app-dev ./frontend-chart \
  --values ./frontend-chart/values/dev.yaml \
  --namespace dev

# 5. Watch rollout
kubectl rollout status deployment/frontend-chart-dev -n dev
```

## Clean Up

To remove everything:
```bash
# Delete Helm release
helm uninstall frontend-app-dev -n dev

# Delete namespace
kubectl delete namespace dev
```

## Important Notes

1. **Environment Variables**: The backend URL is set to `http://backend1-service-dev:3001/api` in your Helm values. Make sure the backend is deployed in the same cluster.

2. **Security**: Never commit sensitive data (passwords, API keys) to Git. Use Kubernetes Secrets instead.

3. **Monitoring**: Consider setting up monitoring with Prometheus/Grafana to track your app's health.

4. **Backups**: Regularly backup your persistent data if using databases.

## Next Steps

- Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- Add health monitoring and alerts
- Configure auto-scaling based on load
- Set up staging and production environments