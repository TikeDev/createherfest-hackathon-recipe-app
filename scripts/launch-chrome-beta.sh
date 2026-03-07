#!/bin/bash
# Launch Chrome Beta with remote debugging for MCP server connection
# Usage: ./launch-chrome-beta.sh [--fresh] [--profile-dir=/path] [URL]
#   --fresh: Use temporary profile (default: persistent profile)
#   --profile-dir=/path: Override the profile directory
#   URL: URL to open (default: http://localhost:5173)

CHROME_BETA_PATH="/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta"
CHROME_STABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PERSISTENT_PROFILE="$HOME/.simmer-chrome-debug"
TEMP_PROFILE="/tmp/simmer-debug-profile-$$"
DEFAULT_URL="http://localhost:5173"

# Pick whichever Chrome is available (Beta preferred)
if [ -f "$CHROME_BETA_PATH" ]; then
  CHROME_PATH="$CHROME_BETA_PATH"
elif [ -f "$CHROME_STABLE_PATH" ]; then
  CHROME_PATH="$CHROME_STABLE_PATH"
  echo "⚠️  Chrome Beta not found, falling back to Chrome stable"
  echo "   Install Chrome Beta for an isolated debug profile: https://www.google.com/chrome/beta/"
else
  echo "❌ No Chrome installation found"
  exit 1
fi

USE_FRESH=false
PROFILE_OVERRIDE=""
TARGET_URL="$DEFAULT_URL"

for arg in "$@"; do
  if [[ "$arg" == "--fresh" ]]; then
    USE_FRESH=true
  elif [[ "$arg" == --profile-dir=* ]]; then
    PROFILE_OVERRIDE="${arg#--profile-dir=}"
  elif [[ "$arg" == http* ]]; then
    TARGET_URL="$arg"
  fi
done

if [ -n "$PROFILE_OVERRIDE" ]; then
  USER_DATA_DIR="$PROFILE_OVERRIDE"
  echo "🧩 Using custom profile at $USER_DATA_DIR"
elif [ "$USE_FRESH" = true ]; then
  USER_DATA_DIR="$TEMP_PROFILE"
  echo "🧹 Using temporary profile (will be cleaned on close)"
else
  USER_DATA_DIR="$PERSISTENT_PROFILE"
  echo "💾 Using persistent profile at $PERSISTENT_PROFILE"
fi

echo "🚀 Launching Chrome with remote debugging on port 9222..."
echo "   Opening: $TARGET_URL"

"$CHROME_PATH" \
  --remote-debugging-port=9222 \
  --user-data-dir="$USER_DATA_DIR" \
  --no-first-run \
  --no-default-browser-check \
  --disable-default-apps \
  "$TARGET_URL"
