#!/bin/bash
# ND Compass — Android build script
# Run this whenever you want to update the Android app

set -e

echo "📦 Building Next.js static export..."
npm run build

echo "📱 Syncing to Capacitor Android..."
npx cap sync android

echo "✅ Done! Opening Android Studio..."
npx cap open android
