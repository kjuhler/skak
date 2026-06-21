#!/usr/bin/env bash
# Starter Skak i fuldskærm kiosk-tilstand (HTPC)
set -euo pipefail

PORT="${SKAK_PORT:-3002}"
URL="http://localhost:${PORT}"

# Vent på at serveren er klar
for i in $(seq 1 30); do
  if curl -sf "$URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

BROWSER=""
for candidate in chromium-browser chromium google-chrome brave-browser firefox; do
  if command -v "$candidate" &>/dev/null; then
    BROWSER="$candidate"
    break
  fi
done

if [[ -z "$BROWSER" ]]; then
  echo "Fejl: Ingen browser fundet. Installer chromium med:"
  echo "  sudo dnf install chromium    # Nobara/Fedora"
  exit 1
fi

echo "Starter kiosk med $BROWSER → $URL"

case "$BROWSER" in
  firefox)
    exec "$BROWSER" --kiosk "$URL"
    ;;
  *)
    exec "$BROWSER" \
      --kiosk \
      --noerrdialogs \
      --disable-infobars \
      --disable-session-crashed-bubble \
      --autoplay-policy=no-user-gesture-required \
      --use-fake-ui-for-media-stream \
      "$URL"
    ;;
esac
