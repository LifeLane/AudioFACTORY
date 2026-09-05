#!/bin/bash
# ==============================================================================
# AudioFACTORY - Android Production Release Keystore Generator
# ==============================================================================

set -e

KEYSTORE_DIR="./android/keystores"
KEYSTORE_FILE="${KEYSTORE_DIR}/audiofactory-release.jks"
KEY_ALIAS="audiofactory_release"
VALIDITY_DAYS=10000

mkdir -p "${KEYSTORE_DIR}"

if [ -f "${KEYSTORE_FILE}" ]; then
    echo "⚠️  Keystore already exists at ${KEYSTORE_FILE}"
    echo "To regenerate, remove it first."
    exit 0
fi

echo "🔐 Generating AudioFACTORY Production Release Keystore..."
echo "--------------------------------------------------------"

keytool -genkeypair \
    -v \
    -keystore "${KEYSTORE_FILE}" \
    -alias "${KEY_ALIAS}" \
    -keyalg RSA \
    -keysize 2048 \
    -validity "${VALIDITY_DAYS}" \
    -storepass "audiofactory_secure_store_2025" \
    -keypass "audiofactory_secure_store_2025" \
    -dname "CN=AudioFACTORY Release, OU=Audio Production, O=AudioFACTORY Inc, L=Mountain View, ST=California, C=US"

echo "✅ Release Keystore successfully created at: ${KEYSTORE_FILE}"
echo ""
echo "To build a signed release App Bundle (.aab):"
echo "  export KEYSTORE_PATH=\"$(pwd)/${KEYSTORE_FILE}\""
echo "  export KEYSTORE_PASSWORD=\"audiofactory_secure_store_2025\""
echo "  export KEY_ALIAS=\"${KEY_ALIAS}\""
echo "  export KEY_PASSWORD=\"audiofactory_secure_store_2025\""
echo "  cd android && ./gradlew bundleRelease"
echo ""
