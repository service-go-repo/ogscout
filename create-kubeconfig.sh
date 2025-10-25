#!/bin/bash

# Script to create a kubeconfig for GitHub Actions
# This creates a safe kubeconfig with proper quoting

set -e

echo "🔧 Creating kubeconfig for GitHub Actions..."
echo ""

# Check if kubectl is configured
if ! kubectl cluster-info &>/dev/null; then
    echo "❌ Error: kubectl is not configured or cluster is not accessible"
    echo "Please configure kubectl first: kubectl cluster-info"
    exit 1
fi

echo "✅ kubectl is configured"
echo ""

# Get cluster information
echo "📋 Gathering cluster information..."
CLUSTER_NAME=$(kubectl config view -o jsonpath='{.clusters[0].name}')
CLUSTER_SERVER=$(kubectl config view -o jsonpath='{.clusters[0].cluster.server}')
CLUSTER_CA=$(kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')

echo "   Cluster Name: ${CLUSTER_NAME}"
echo "   Cluster Server: ${CLUSTER_SERVER}"
echo ""

# Check if we should use existing kubeconfig or create new one
echo "Choose an option:"
echo "1) Use existing kubeconfig (quick, less secure)"
echo "2) Create service account kubeconfig (recommended)"
read -p "Enter choice [1 or 2]: " CHOICE

if [ "$CHOICE" == "1" ]; then
    echo ""
    echo "📄 Using existing kubeconfig..."

    # Use existing kubeconfig
    KUBECONFIG_FILE="$HOME/.kube/config"

    if [ ! -f "$KUBECONFIG_FILE" ]; then
        echo "❌ Error: kubeconfig not found at $KUBECONFIG_FILE"
        exit 1
    fi

    echo ""
    echo "🔐 Base64 encoded kubeconfig for GitHub Secret:"
    echo "================================================"
    cat "$KUBECONFIG_FILE" | base64 -w 0 2>/dev/null || cat "$KUBECONFIG_FILE" | base64
    echo ""
    echo "================================================"
    echo ""
    echo "✅ Copy the above output and add it as KUBECONFIG_PROD or KUBECONFIG_DEV secret in GitHub"

elif [ "$CHOICE" == "2" ]; then
    echo ""
    read -p "Enter namespace (ogscout-dev or ogscout-prod): " NAMESPACE

    # Create namespace if not exists
    echo ""
    echo "📦 Creating namespace ${NAMESPACE}..."
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

    # Create service account
    echo "👤 Creating service account..."
    SA_NAME="github-actions-deployer"
    kubectl create serviceaccount ${SA_NAME} -n ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

    # Create cluster role binding
    echo "🔑 Creating cluster role binding..."
    kubectl create clusterrolebinding ${SA_NAME}-${NAMESPACE} \
        --clusterrole=cluster-admin \
        --serviceaccount=${NAMESPACE}:${SA_NAME} \
        --dry-run=client -o yaml | kubectl apply -f -

    # Get service account token
    echo "🎫 Generating service account token..."
    SA_TOKEN=$(kubectl create token ${SA_NAME} -n ${NAMESPACE} --duration=87600h 2>/dev/null || kubectl get secret $(kubectl get sa ${SA_NAME} -n ${NAMESPACE} -o jsonpath='{.secrets[0].name}') -n ${NAMESPACE} -o jsonpath='{.data.token}' | base64 -d)

    if [ -z "$SA_TOKEN" ]; then
        echo "❌ Error: Could not get service account token"
        exit 1
    fi

    # Create kubeconfig file
    echo "📝 Creating kubeconfig file..."
    OUTPUT_FILE="github-actions-kubeconfig-${NAMESPACE}.yaml"

    cat > ${OUTPUT_FILE} <<EOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: ${CLUSTER_CA}
    server: ${CLUSTER_SERVER}
  name: ${CLUSTER_NAME}
contexts:
- context:
    cluster: ${CLUSTER_NAME}
    namespace: ${NAMESPACE}
    user: ${SA_NAME}
  name: github-actions-${NAMESPACE}
current-context: github-actions-${NAMESPACE}
users:
- name: ${SA_NAME}
  user:
    token: ${SA_TOKEN}
EOF

    # Verify the kubeconfig works
    echo ""
    echo "🧪 Testing kubeconfig..."
    if kubectl --kubeconfig=${OUTPUT_FILE} cluster-info &>/dev/null; then
        echo "✅ Kubeconfig is valid!"
    else
        echo "⚠️  Warning: Could not verify kubeconfig. Please test manually."
    fi

    echo ""
    echo "🔐 Base64 encoded kubeconfig for GitHub Secret:"
    echo "================================================"
    cat ${OUTPUT_FILE} | base64 -w 0 2>/dev/null || cat ${OUTPUT_FILE} | base64
    echo ""
    echo "================================================"
    echo ""
    echo "📁 Kubeconfig saved to: ${OUTPUT_FILE}"
    echo ""
    echo "✅ Copy the base64 output above and add it as KUBECONFIG_PROD or KUBECONFIG_DEV in GitHub"
    echo ""
    read -p "Delete the kubeconfig file? [y/N]: " DELETE_FILE
    if [ "$DELETE_FILE" == "y" ] || [ "$DELETE_FILE" == "Y" ]; then
        rm ${OUTPUT_FILE}
        echo "🗑️  File deleted"
    fi
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Add the base64 encoded kubeconfig to GitHub Secrets"
echo "2. Go to: https://github.com/YOUR_USERNAME/ogscout/settings/secrets/actions"
echo "3. Click 'New repository secret'"
echo "4. Name: KUBECONFIG_PROD (or KUBECONFIG_DEV)"
echo "5. Value: Paste the base64 encoded kubeconfig"
echo "6. Click 'Add secret'"
echo ""
echo "✨ Done!"
