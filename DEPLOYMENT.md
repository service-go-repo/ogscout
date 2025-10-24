# OGScout Deployment Guide

Complete guide for deploying the OGScout Next.js application to Kubernetes with CI/CD pipeline.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Kubernetes Cluster Setup](#kubernetes-cluster-setup)
6. [Deployment Process](#deployment-process)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Technology Stack

- **Application**: Next.js 15 (Monolithic - Frontend + API Routes)
- **Database**: MongoDB Atlas / Self-hosted MongoDB
- **Container Registry**: GitHub Container Registry (GHCR)
- **CI/CD**: GitHub Actions
- **Orchestration**: Kubernetes (K8s)
- **Ingress**: Nginx Ingress Controller
- **TLS/SSL**: cert-manager with Let's Encrypt

### Environments

| Environment | Branch   | Namespace      | URL                     |
|-------------|----------|----------------|-------------------------|
| Development | develop  | ogscout-dev    | https://dev.ogscout.com |
| Production  | main     | ogscout-prod   | https://ogscout.com     |

---

## Prerequisites

### Required Tools

1. **kubectl** - Kubernetes command-line tool
   ```bash
   # Install kubectl
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x kubectl
   sudo mv kubectl /usr/local/bin/
   ```

2. **kustomize** - Kubernetes native configuration management
   ```bash
   curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
   sudo mv kustomize /usr/local/bin/
   ```

3. **Docker** - For local testing
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

### Kubernetes Cluster

You need access to a Kubernetes cluster. Options include:

- **Cloud Providers**: AWS EKS, Google GKE, Azure AKS, DigitalOcean Kubernetes
- **Self-hosted**: kubeadm, k3s, microk8s
- **Local development**: minikube, kind, Docker Desktop

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ogscout.git
cd ogscout
```

### 2. Install Required Kubernetes Components

#### Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

#### Install cert-manager (for TLS certificates)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

#### Create Let's Encrypt ClusterIssuers

Create `letsencrypt-issuer.yaml`:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx

---
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
```

Apply the issuer:

```bash
kubectl apply -f letsencrypt-issuer.yaml
```

### 3. Create Namespaces

```bash
kubectl apply -f k8s/base/namespace.yaml
```

---

## GitHub Secrets Configuration

### Required GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

#### Kubernetes Credentials

1. **KUBECONFIG_DEV** - Base64 encoded kubeconfig for dev cluster
   ```bash
   cat ~/.kube/config | base64 -w 0
   ```

2. **KUBECONFIG_PROD** - Base64 encoded kubeconfig for prod cluster
   ```bash
   cat ~/.kube/config | base64 -w 0
   ```

#### MongoDB Credentials (Development)

- `MONGODB_URI_DEV` - Full MongoDB connection string
  ```
  mongodb+srv://username:password@cluster.mongodb.net/repair-connect?retryWrites=true&w=majority
  ```
- `MONGODB_USERNAME_DEV` - MongoDB username
- `MONGODB_PASSWORD_DEV` - MongoDB password

#### MongoDB Credentials (Production)

- `MONGODB_URI_PROD` - Full MongoDB connection string
- `MONGODB_USERNAME_PROD` - MongoDB username
- `MONGODB_PASSWORD_PROD` - MongoDB password

#### NextAuth Secrets

- `NEXTAUTH_SECRET_DEV` - Random secret (min 32 characters)
  ```bash
  openssl rand -base64 32
  ```
- `NEXTAUTH_SECRET_PROD` - Different random secret

#### Cloudinary (Image Storage)

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

#### Google Maps (Optional)

- `GOOGLE_MAPS_API_KEY` - Google Maps API key

---

## Kubernetes Cluster Setup

### Manual Secret Creation (Alternative to CI/CD)

If you want to create secrets manually instead of via GitHub Actions:

#### Development Environment

```bash
kubectl create secret generic ogscout-secrets \
  --from-literal=MONGODB_URI='your-mongodb-uri' \
  --from-literal=MONGODB_USERNAME='your-username' \
  --from-literal=MONGODB_PASSWORD='your-password' \
  --from-literal=NEXTAUTH_SECRET='your-nextauth-secret' \
  --from-literal=NEXTAUTH_URL='https://dev.ogscout.com' \
  --from-literal=CLOUDINARY_CLOUD_NAME='your-cloud-name' \
  --from-literal=CLOUDINARY_API_KEY='your-api-key' \
  --from-literal=CLOUDINARY_API_SECRET='your-api-secret' \
  --from-literal=NEXT_PUBLIC_GOOGLE_MAPS_API_KEY='your-maps-key' \
  --namespace=ogscout-dev
```

#### Production Environment

```bash
kubectl create secret generic ogscout-secrets \
  --from-literal=MONGODB_URI='your-mongodb-uri' \
  --from-literal=MONGODB_USERNAME='your-username' \
  --from-literal=MONGODB_PASSWORD='your-password' \
  --from-literal=NEXTAUTH_SECRET='your-nextauth-secret' \
  --from-literal=NEXTAUTH_URL='https://ogscout.com' \
  --from-literal=CLOUDINARY_CLOUD_NAME='your-cloud-name' \
  --from-literal=CLOUDINARY_API_KEY='your-api-key' \
  --from-literal=CLOUDINARY_API_SECRET='your-api-secret' \
  --from-literal=NEXT_PUBLIC_GOOGLE_MAPS_API_KEY='your-maps-key' \
  --namespace=ogscout-prod
```

### Create GHCR Pull Secret

```bash
# Development
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  --namespace=ogscout-dev

# Production
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  --namespace=ogscout-prod
```

---

## Deployment Process

### Automated Deployment (via GitHub Actions)

#### Development Deployment

1. Create and push to `develop` branch:
   ```bash
   git checkout -b develop
   git push origin develop
   ```

2. GitHub Actions will automatically:
   - Run tests and linting
   - Build Docker image
   - Push to GHCR
   - Deploy to dev namespace
   - Verify deployment

#### Production Deployment

1. Merge changes to `main` branch:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. GitHub Actions will:
   - Run tests and security scans
   - Build and scan Docker image
   - **Wait for manual approval** (if configured)
   - Deploy to production namespace
   - Verify deployment with health checks
   - Rollback automatically on failure

### Manual Deployment (using kubectl)

#### Deploy to Development

```bash
cd k8s/overlays/dev
kustomize build . | kubectl apply -f -
kubectl rollout status deployment/ogscout-app -n ogscout-dev
```

#### Deploy to Production

```bash
cd k8s/overlays/prod
kustomize build . | kubectl apply -f -
kubectl rollout status deployment/ogscout-app -n ogscout-prod
```

---

## Monitoring and Maintenance

### Check Deployment Status

```bash
# Development
kubectl get all -n ogscout-dev

# Production
kubectl get all -n ogscout-prod
```

### View Logs

```bash
# Development
kubectl logs -n ogscout-dev -l app=ogscout --tail=100 -f

# Production
kubectl logs -n ogscout-prod -l app=ogscout --tail=100 -f
```

### Check HPA Status

```bash
kubectl get hpa -n ogscout-prod
kubectl describe hpa ogscout-hpa -n ogscout-prod
```

### Scale Manually (if needed)

```bash
kubectl scale deployment ogscout-app --replicas=5 -n ogscout-prod
```

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/ogscout-app -n ogscout-prod

# Rollback to previous version
kubectl rollout undo deployment/ogscout-app -n ogscout-prod

# Rollback to specific revision
kubectl rollout undo deployment/ogscout-app --to-revision=2 -n ogscout-prod
```

---

## Troubleshooting

### Common Issues

#### 1. ImagePullBackOff

**Symptom**: Pods stuck in `ImagePullBackOff` state

**Solution**:
```bash
# Check if GHCR secret exists
kubectl get secret ghcr-secret -n ogscout-dev

# Recreate the secret
kubectl delete secret ghcr-secret -n ogscout-dev
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  --namespace=ogscout-dev
```

#### 2. CrashLoopBackOff

**Symptom**: Pods restarting continuously

**Solution**:
```bash
# Check logs
kubectl logs -n ogscout-dev -l app=ogscout --previous

# Check events
kubectl describe pod -n ogscout-dev -l app=ogscout

# Verify secrets are correct
kubectl get secret ogscout-secrets -n ogscout-dev -o yaml
```

#### 3. Health Check Failures

**Symptom**: Pods failing readiness/liveness probes

**Solution**:
```bash
# Check if health endpoint is accessible
kubectl exec -it -n ogscout-dev deployment/ogscout-app -- curl localhost:3000/api/health

# Temporarily increase probe timeouts in deployment.yaml
```

#### 4. TLS Certificate Issues

**Symptom**: HTTPS not working or certificate errors

**Solution**:
```bash
# Check certificate status
kubectl get certificate -n ogscout-prod
kubectl describe certificate ogscout-tls-secret -n ogscout-prod

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

### Debug Commands

```bash
# Get detailed pod information
kubectl describe pod <pod-name> -n ogscout-dev

# Execute commands inside pod
kubectl exec -it <pod-name> -n ogscout-dev -- /bin/sh

# Port forward for local testing
kubectl port-forward -n ogscout-dev deployment/ogscout-app 3000:3000

# Check resource usage
kubectl top pods -n ogscout-prod
kubectl top nodes
```

---

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use separate credentials** for dev and prod
3. **Rotate secrets** regularly
4. **Enable RBAC** on your cluster
5. **Use network policies** to restrict pod communication
6. **Keep images updated** and scan for vulnerabilities
7. **Enable pod security policies**
8. **Use read-only root filesystem** where possible

---

## Backup and Disaster Recovery

### Database Backups

```bash
# MongoDB backup (if self-hosted)
kubectl exec -it mongodb-0 -n ogscout-prod -- mongodump --out /backup

# For MongoDB Atlas, use automated backups in the dashboard
```

### Kubernetes Resource Backups

```bash
# Export all resources
kubectl get all -n ogscout-prod -o yaml > backup-prod.yaml
```

---

## Performance Optimization

1. **Enable HPA** - Horizontal Pod Autoscaler is configured
2. **Resource Limits** - Set appropriate CPU/memory limits
3. **Image Caching** - Utilize build cache in GitHub Actions
4. **CDN** - Use Cloudinary for image delivery
5. **Database Indexing** - Ensure MongoDB has proper indexes
6. **Monitoring** - Set up Prometheus and Grafana

---

## Support

For issues or questions:
- Create an issue on GitHub
- Contact DevOps team
- Check logs and events using kubectl commands above

---

**Last Updated**: 2025-10-24
**Version**: 1.0.0
