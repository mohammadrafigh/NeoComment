#!/usr/bin/env bash
set -euo pipefail

IN_CONTAINER=${IN_CONTAINER:-0}

if [ "${IN_CONTAINER}" != "1" ]; then
  # Running on host: build the image and run the container with this script inside it
  VERSION_NAME=$(grep -oP 'versionName "\K[^"]+' App_Resources/Android/app.gradle)
  COMPILE_SDK_VERSION=$(grep -oP 'compileSdkVersion \K[^*]+' App_Resources/Android/app.gradle)

  echo "Building Docker image and running container..."
  docker build -f Dockerfile -t neo-release-builder .

  docker run --rm \
    -e IN_CONTAINER=1 \
    -e VERSION_NAME="${VERSION_NAME}" \
    -e COMPILE_SDK_VERSION="${COMPILE_SDK_VERSION}" \
    -e BUILD_TOOLS_VERSION="35.0.1" \
    -e KEYSTORE_PASSWORD="${KEYSTORE_PASSWORD:-NULL}" \
    -e KEY_ALIAS="${KEY_ALIAS:-NULL}" \
    -e KEY_PASSWORD="${KEY_PASSWORD:-NULL}" \
    -e ANDROID_KEYSTORE="${ANDROID_KEYSTORE:-}" \
    -v "$(pwd)":/workspace -w /workspace \
    neo-release-builder bash /workspace/build.sh
  exit $?
fi

# ------------------ inside-container build steps ------------------
echo "Decoding keystore..."
if [ -n "${ANDROID_KEYSTORE}" ]; then
  echo "$ANDROID_KEYSTORE" | base64 -d > my-release-key.keystore
  KEYSTORE_PATH="my-release-key.keystore"
else
  KEYSTORE_PATH="/dev/null"
fi

echo "Ensuring Android platforms and build-tools are installed..."
sdkmanager "platforms;android-${COMPILE_SDK_VERSION}" "build-tools;${BUILD_TOOLS_VERSION}"

echo "Installing node dependencies..."
npm ci

echo "Running NativeScript Android release build..."
ns build android --release --env.snapshot --env.compileSnapshot --env.uglify --env.aot \
  --key-store-path "${KEYSTORE_PATH}" \
  --key-store-password "${KEYSTORE_PASSWORD}" \
  --key-store-alias "${KEY_ALIAS}" \
  --key-store-alias-password "${KEY_PASSWORD}"

echo "Collecting APK..."
mkdir -p release_apks
DEFAULT_APK="platforms/android/app/build/outputs/apk/release/app-arm64-v8a-release*.apk"
mv "$DEFAULT_APK" "release_apks/NeoComment-${VERSION_NAME}.apk"

echo "Build finished. APK is in release_apks/NeoComment-${VERSION_NAME}.apk"
