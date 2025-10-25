# MongoDB on Kubernetes - Complete Setup Guide

## 🎯 Overview

Your application now has **MongoDB running inside Kubernetes** instead of requiring external MongoDB Atlas. This provides better integration, lower latency, and full control over your database.

---

## 📦 MongoDB Resources Created

### 1. **StatefulSet** (`mongodb-statefulset.yaml`)
- Manages MongoDB pod with persistent storage
- Uses `mongo:7.0` official image
- Configured with liveness and readiness probes
- **Storage**:
  - 10Gi for data (`/data/db`)
  - 1Gi for config (`/data/configdb`)

### 2. **Services** (`mongodb-service.yaml`)
- **Headless Service** (`mongodb-service`): For StatefulSet
- **Client Service** (`mongodb`): For application connections
- **Internal DNS**: `mongodb.ogscout-prod.svc.cluster.local`

### 3. **Secrets** (`mongodb-secret.yaml`)
- Root username: `admin`
- Root password: Set via GitHub Secrets
- Application user credentials

### 4. **Initialization Job** (`mongodb-init-job.yaml`)
- Runs once after MongoDB starts
- Creates application database user
- Creates indexes for performance
- **Indexes Created:**
  - `users.email` (unique)
  - `workshops.email` (unique)
  - `cars.userId`
  - `quotations.userId`
  - `quotations.workshopId`
  - `appointments.userId`
  - `appointments.workshopId`
  - `serviceRequests.userId`

### 5. **Backup CronJob** (`mongodb-backup-cronjob.yaml`)
- Runs daily at 2 AM
- Creates compressed backups
- Retains last 7 days
- **Storage**: 20Gi for backups

---

## 🔐 Required GitHub Secrets

Add these secrets to your GitHub repository:

### Production:
```
MONGODB_ROOT_PASSWORD      # Strong password for MongoDB root user
MONGODB_USERNAME_PROD      # repair-connect-app (recommended)
MONGODB_PASSWORD_PROD      # Strong password for app user
```

### Development:
```
MONGODB_ROOT_PASSWORD_DEV  # Strong password for MongoDB root user
MONGODB_USERNAME_DEV       # repair-connect-app (recommended)
MONGODB_PASSWORD_DEV       # Strong password for app user
```

### How to Add Secrets:
```bash
# Go to GitHub repository
https://github.com/YOUR_USERNAME/ogscout/settings/secrets/actions

# Click "New repository secret"
# Add each secret with strong passwords

# Generate strong passwords:
openssl rand -base64 32
```

---

## 🚀 Deployment Flow

### Automatic Deployment:

When you push to `main` or `develop`, the workflow:

1. **Creates MongoDB Secret**
   ```bash
   kubectl create secret generic mongodb-secret \
     --from-literal=MONGO_ROOT_USERNAME="admin" \
     --from-literal=MONGO_ROOT_PASSWORD="<from-github-secret>"
   ```

2. **Creates Application Secret**
   ```bash
   # MongoDB URI uses Kubernetes internal service
   MONGODB_URI="mongodb://user:pass@mongodb:27017/repair-connect"
   ```

3. **Deploys MongoDB**
   - StatefulSet creates MongoDB pod
   - PersistentVolumes are automatically provisioned
   - Services expose MongoDB internally

4. **Initializes Database**
   - Init job waits for MongoDB to be ready
   - Creates application user
   - Creates indexes

5. **Deploys Application**
   - App connects to `mongodb:27017`
   - Uses credentials from secrets

---

## 🔍 Verification Commands

### Check MongoDB Pod:
```bash
# Production
kubectl get pods -n ogscout-prod -l app=mongodb

# Should show:
# NAME        READY   STATUS    RESTARTS   AGE
# mongodb-0   1/1     Running   0          5m
```

### Check MongoDB Service:
```bash
kubectl get svc -n ogscout-prod -l app=mongodb

# Should show:
# NAME              TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)     AGE
# mongodb           ClusterIP   10.x.x.x     <none>        27017/TCP   5m
# mongodb-service   ClusterIP   None         <none>        27017/TCP   5m
```

### Check PersistentVolumes:
```bash
kubectl get pvc -n ogscout-prod

# Should show:
# NAME                      STATUS   VOLUME   CAPACITY   STORAGECLASS
# mongodb-data-mongodb-0    Bound    pv-xxx   10Gi       standard
# mongodb-config-mongodb-0  Bound    pv-yyy   1Gi        standard
# mongodb-backup-pvc        Bound    pv-zzz   20Gi       standard
```

### Check Init Job:
```bash
kubectl get jobs -n ogscout-prod

# Should show:
# NAME            COMPLETIONS   DURATION   AGE
# mongodb-init    1/1           30s        5m
```

### View MongoDB Logs:
```bash
kubectl logs -n ogscout-prod mongodb-0
```

### Check Backup CronJob:
```bash
kubectl get cronjobs -n ogscout-prod

# Should show:
# NAME             SCHEDULE    SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# mongodb-backup   0 2 * * *   False     0        <none>          5m
```

---

## 🔧 Manual Operations

### Connect to MongoDB Shell:
```bash
# Get MongoDB password
MONGO_PASS=$(kubectl get secret mongodb-secret -n ogscout-prod -o jsonpath='{.data.MONGO_ROOT_PASSWORD}' | base64 -d)

# Connect to MongoDB
kubectl exec -it mongodb-0 -n ogscout-prod -- mongosh -u admin -p $MONGO_PASS --authenticationDatabase admin

# Inside mongosh:
use repair-connect
show collections
db.users.countDocuments()
db.workshops.countDocuments()
```

### Create Manual Backup:
```bash
# Run backup job manually
kubectl create job --from=cronjob/mongodb-backup mongodb-backup-manual -n ogscout-prod

# Check job status
kubectl get jobs -n ogscout-prod

# View logs
kubectl logs job/mongodb-backup-manual -n ogscout-prod
```

### Restore from Backup:
```bash
# Copy backup file to local
kubectl cp ogscout-prod/mongodb-0:/backup/repair-connect_20250124_020000.gz ./backup.gz

# Restore to MongoDB
kubectl exec -it mongodb-0 -n ogscout-prod -- bash
cd /backup
mongorestore \
  --username=admin \
  --password=$MONGO_ROOT_PASSWORD \
  --authenticationDatabase=admin \
  --archive=repair-connect_20250124_020000.gz \
  --gzip \
  --drop
```

### Scale MongoDB (NOT RECOMMENDED):
```bash
# MongoDB StatefulSet is configured for single replica
# For production HA, use MongoDB ReplicaSet (advanced setup)
```

---

## 📊 Monitoring

### Check Database Size:
```bash
kubectl exec mongodb-0 -n ogscout-prod -- mongosh \
  -u admin \
  -p $(kubectl get secret mongodb-secret -n ogscout-prod -o jsonpath='{.data.MONGO_ROOT_PASSWORD}' | base64 -d) \
  --authenticationDatabase admin \
  --eval "db.stats()"
```

### Check Storage Usage:
```bash
kubectl exec mongodb-0 -n ogscout-prod -- df -h /data/db
```

### View Slow Queries:
```bash
kubectl exec mongodb-0 -n ogscout-prod -- mongosh \
  -u admin \
  -p <password> \
  --authenticationDatabase admin \
  --eval "db.setProfilingLevel(1, { slowms: 100 })"
```

---

## 🛠️ Troubleshooting

### Issue 1: MongoDB Pod Not Starting

**Check:**
```bash
kubectl describe pod mongodb-0 -n ogscout-prod
kubectl logs mongodb-0 -n ogscout-prod
```

**Common Causes:**
- PersistentVolume provisioning failed
- Insufficient cluster resources
- StorageClass not available

**Solution:**
```bash
# Check if PVC is bound
kubectl get pvc -n ogscout-prod

# Check storage classes
kubectl get storageclass

# If no default storage class, set one:
kubectl patch storageclass <your-storage-class> -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### Issue 2: Init Job Failing

**Check:**
```bash
kubectl logs job/mongodb-init -n ogscout-prod
```

**Common Causes:**
- MongoDB not ready yet
- Wrong credentials
- Network issues

**Solution:**
```bash
# Delete and recreate job
kubectl delete job mongodb-init -n ogscout-prod

# Job will be recreated by kustomize on next deployment
```

### Issue 3: Application Can't Connect

**Check:**
```bash
# Test connection from application pod
kubectl exec -it <app-pod> -n ogscout-prod -- sh
nc -zv mongodb 27017

# Check if secret exists
kubectl get secret ogscout-secrets -n ogscout-prod

# View secret (base64 encoded)
kubectl get secret ogscout-secrets -n ogscout-prod -o yaml
```

**Solution:**
```bash
# Verify MONGODB_URI format
kubectl get secret ogscout-secrets -n ogscout-prod -o jsonpath='{.data.MONGODB_URI}' | base64 -d

# Should be:
# mongodb://username:password@mongodb:27017/repair-connect?authSource=repair-connect
```

### Issue 4: Data Lost After Pod Restart

**Check:**
```bash
# Verify PV is bound
kubectl get pvc mongodb-data-mongodb-0 -n ogscout-prod

# Check PV status
kubectl get pv
```

**Solution:**
- Ensure PersistentVolumes are properly configured
- Check storage class supports dynamic provisioning
- Verify data is being written to `/data/db` not ephemeral storage

### Issue 5: Backup Job Failing

**Check:**
```bash
kubectl logs cronjob/mongodb-backup -n ogscout-prod
```

**Solution:**
```bash
# Check if backup PVC is bound
kubectl get pvc mongodb-backup-pvc -n ogscout-prod

# Create PVC manually if needed
kubectl apply -f k8s/base/mongodb-backup-cronjob.yaml
```

---

## 🔄 Migration from MongoDB Atlas

If you were using MongoDB Atlas before:

### Option 1: Export and Import
```bash
# From Atlas:
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/repair-connect" --archive=dump.gz --gzip

# To Kubernetes:
kubectl cp dump.gz ogscout-prod/mongodb-0:/tmp/
kubectl exec mongodb-0 -n ogscout-prod -- mongorestore \
  --username=admin \
  --password=<password> \
  --authenticationDatabase=admin \
  --archive=/tmp/dump.gz \
  --gzip
```

### Option 2: Keep Using Atlas
If you prefer MongoDB Atlas, simply update GitHub Secrets:
```bash
# Set MONGODB_URI_PROD to Atlas connection string
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/repair-connect

# Comment out MongoDB resources in kustomization.yaml
```

---

## 📈 Production Recommendations

### 1. Enable Authentication
✅ Already configured - MongoDB requires authentication

### 2. Enable Backups
✅ Already configured - Daily backups at 2 AM

### 3. Monitor Disk Usage
```bash
# Set up alerts when PV is > 80% full
kubectl top nodes
```

### 4. Use StorageClass with Snapshots
```yaml
# In mongodb-statefulset.yaml, set:
volumeClaimTemplates:
  - metadata:
      name: mongodb-data
    spec:
      storageClassName: premium-rwo  # Use SSD for better performance
```

### 5. Enable Replication (Advanced)
For high availability, consider MongoDB ReplicaSet:
- Minimum 3 replicas
- Automated failover
- Requires more complex setup

### 6. Resource Limits
Current limits:
- **Memory**: 512Mi request, 1Gi limit
- **CPU**: 250m request, 500m limit
- **Storage**: 10Gi data, 1Gi config

Adjust based on your needs in `mongodb-statefulset.yaml`

### 7. Network Policies
Restrict MongoDB access to application pods only:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-network-policy
spec:
  podSelector:
    matchLabels:
      app: mongodb
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: ogscout
    ports:
    - protocol: TCP
      port: 27017
```

---

## 📝 Summary

### What's Deployed:
- ✅ MongoDB 7.0 in StatefulSet
- ✅ Persistent storage (10Gi data + 1Gi config)
- ✅ Internal services for connectivity
- ✅ Automatic initialization with indexes
- ✅ Daily backups with 7-day retention
- ✅ Secure authentication

### MongoDB Access:
- **Internal DNS**: `mongodb.ogscout-prod.svc.cluster.local:27017`
- **Short DNS**: `mongodb:27017` (same namespace)
- **Database**: `repair-connect`
- **Auth**: Username/password from secrets

### Connection String:
```
mongodb://username:password@mongodb:27017/repair-connect?authSource=repair-connect
```

---

**Your MongoDB is now fully integrated with Kubernetes!** 🎉

All database operations happen within your cluster with persistent storage and automated backups.

---

**Last Updated:** 2025-01-24
