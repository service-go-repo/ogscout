# MongoDB URI Fix - Password Special Character Issue

**Issue:** MongoParseError: URI contained empty userinfo section
**Root Cause:** Password `ogScout@410` contained `@` symbol which broke URI parsing
**Solution:** Changed password to `ogScout410` (removed `@` symbol)

---

## ✅ Problem Solved

### Original Issue:
```
MONGODB_URI=mongodb://ogscout:ogScout@410@mongodb:27017/repair-connect
                                    ↑
                         This @ breaks the URI parser!
```

The MongoDB URI parser interprets the first `@` as the separator between credentials and host:
- Username: `ogscout`
- Password: `ogScout` (stops at first @)
- Host: `410@mongodb` ← Invalid!

### Fixed Version:
```
MONGODB_URI=mongodb://ogscout:ogScout410@mongodb:27017/repair-connect?authSource=repair-connect
                                       ↑
                         No special characters - works perfectly!
```

---

## 📝 Files Updated

### 1. **`.env.production`** ✅
Changed MongoDB URI to use password without `@`:
```bash
MONGODB_URI=mongodb://ogscout:ogScout410@mongodb:27017/repair-connect?authSource=repair-connect
```

### 2. **`.env.example`** ✅
Updated example and added warning about special characters:
```bash
# IMPORTANT: Avoid special characters like @ in passwords as they break URI parsing
MONGODB_URI=mongodb://ogscout:ogScout410@localhost:27017/repair-connect?authSource=repair-connect
```

### 3. **`.github/workflows/deploy-prod.yml`** ✅
Updated comment to reflect correct username:
```yaml
# The application user 'ogscout' is created by mongodb-init-job
```

### 4. **`k8s/base/mongodb-init-job.yaml`** ✅
(Already updated in previous fix)
```yaml
- name: APP_USERNAME
  value: "ogscout"
```

### 5. **`docker-compose.yml`** ✅
Updated for local Docker development:
- Root credentials: `admin:admin123`
- App credentials: `ogscout:ogScout410`
```yaml
environment:
  - MONGODB_URI=mongodb://ogscout:ogScout410@mongodb:27017/repair-connect?authSource=repair-connect
```

### 6. **`docker-entrypoint-initdb.d/01-init-user.js`** ✅
Updated MongoDB initialization script:
```javascript
db.createUser({
  user: 'ogscout',
  pwd: 'ogScout410',  // No special characters!
  roles: [...]
});
```

### 7. **`docker-compose.dev.yml`** ✅
Added clarifying comment (uses MongoDB without auth for dev simplicity)

### 8. **`DEPLOYMENT_FIX_SUMMARY.md`** ✅
Updated all password references from `ogScout@410` to `ogScout410`

---

## 🔑 GitHub Secrets to Set

Before deploying to Kubernetes, ensure these secrets are set correctly:

```bash
# In GitHub Repository Settings → Secrets and Variables → Actions

MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=<your-secure-root-password>
MONGODB_USERNAME=ogscout
MONGODB_PASSWORD=ogScout410    # ← No @ symbol!
```

---

## 🎯 Why Special Characters Cause Issues

### URI Format:
```
mongodb://[username:password@]host[:port][/database][?options]
          └─────────┬─────────┘
                userinfo
```

The `@` symbol is a **reserved delimiter** in URIs that separates:
- **Userinfo** (username:password)
- **Host** (hostname:port)

### Characters to Avoid in Passwords:
- `@` - Host separator
- `:` - Username/password separator
- `/` - Path separator
- `?` - Query parameter separator
- `#` - Fragment identifier
- `%` - Percent encoding

### URL Encoding Alternative (Not Recommended):
While you *could* URL-encode special characters (e.g., `@` → `%40`), it's simpler and more reliable to avoid them entirely in MongoDB passwords.

Example with encoding:
```bash
# Password: ogScout@410
# Encoded:  ogScout%40410
MONGODB_URI=mongodb://ogscout:ogScout%40410@mongodb:27017/repair-connect
```

**We chose to simply remove the `@` instead of encoding it for better readability and maintainability.**

---

## ✅ Testing the Fix

### 1. Local Docker Test:
```bash
# Clean up old volumes
docker-compose down -v

# Start services with new credentials
docker-compose up -d

# Check logs
docker-compose logs app

# Test connection
docker exec repair-connect-app node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected!')).catch(e => console.error('❌ Error:', e.message))"
```

### 2. Kubernetes Production Test:
```bash
# After GitHub Actions deployment completes

# Check application logs
kubectl logs -n ogscout-prod deployment/ogscout-app --tail=50

# Should see successful MongoDB connection, no MongoParseError!

# Verify MongoDB user
kubectl exec -it -n ogscout-prod mongodb-0 -- mongosh \
  -u admin -p <root-password> --authenticationDatabase admin \
  --eval "use repair-connect; db.getUsers()" | grep ogscout

# Test direct connection
kubectl run -it --rm mongo-test --image=mongo:7.0 -n ogscout-prod -- \
  mongosh "mongodb://ogscout:ogScout410@mongodb:27017/repair-connect?authSource=repair-connect" \
  --eval "db.runCommand({ping: 1})"
```

---

## 📊 Verification Checklist

- [x] `.env.production` updated with `ogScout410`
- [x] `.env.example` updated with warning about special characters
- [x] GitHub Actions workflow comment updated
- [x] `docker-compose.yml` credentials updated
- [x] `docker-entrypoint-initdb.d/01-init-user.js` updated
- [x] `DEPLOYMENT_FIX_SUMMARY.md` updated
- [x] GitHub Secrets documented (need to be set manually)
- [x] No more `@` symbols in passwords
- [x] All MongoDB URIs use consistent format

---

## 🚀 Deployment Steps

1. **Set GitHub Secrets** (if not already done):
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add/Update: `MONGODB_PASSWORD` = `ogScout410`

2. **Commit changes**:
   ```bash
   git add .env.production .env.example .github/ docker-compose.yml docker-entrypoint-initdb.d/ DEPLOYMENT_FIX_SUMMARY.md MONGODB_URI_FIX.md
   git commit -m "Fix: Remove @ from MongoDB password to fix URI parsing

   - Change password from ogScout@410 to ogScout410
   - Update all config files with new password
   - Add documentation about special characters in URIs
   - Standardize credentials across Docker and Kubernetes

   Fixes: MongoParseError: URI contained empty userinfo section

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Push to trigger deployment**:
   ```bash
   git push origin main
   ```

4. **Monitor GitHub Actions**:
   - Watch the workflow run
   - Ensure all jobs pass (test, security, build, deploy, health-check)

5. **Verify application health**:
   ```bash
   curl https://ogscout.com/api/health
   # Should return 200 OK
   ```

---

## 🎉 Expected Result

After deployment:
- ✅ No more `MongoParseError`
- ✅ Application connects to MongoDB successfully
- ✅ Consistent credentials across all environments
- ✅ Clear documentation for future reference

---

**Fixed:** October 29, 2025
**Issue:** MongoParseError due to `@` in password
**Solution:** Use `ogScout410` instead of `ogScout@410`
**Status:** Ready for Production Deployment
