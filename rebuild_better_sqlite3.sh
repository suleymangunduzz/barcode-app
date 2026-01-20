#!/usr/bin/env bash
set -e

echo "🔧 Setting up macOS developer tools for Electron native modules..."

# 1️⃣ Check if Xcode or CLT is installed
if ! xcode-select -p &>/dev/null; then
  echo "🚨 Command Line Tools not found. Installing..."
  xcode-select --install
  echo "Please re-run this script after installation completes."
  exit 1
fi

# 2️⃣ Set active developer directory
if [ -d "/Applications/Xcode.app/Contents/Developer" ]; then
  echo "Using full Xcode installation"
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
else
  echo "Using Command Line Tools"
  sudo xcode-select --switch /Library/Developer/CommandLineTools
fi

# 3️⃣ Export SDKROOT
export SDKROOT=$(xcrun --show-sdk-path)
echo "✅ SDKROOT set to $SDKROOT"

# 4️⃣ Rebuild better-sqlite3 for Electron
# Replace --version with your Electron version
ELECTRON_VERSION="28.3.3"
echo "🔨 Rebuilding better-sqlite3 for Electron $ELECTRON_VERSION..."
npx electron-rebuild -f -w better-sqlite3 --version $ELECTRON_VERSION --arch arm64

echo "🎉 better-sqlite3 rebuilt successfully!"
