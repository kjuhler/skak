#!/usr/bin/env bash
# Installer Min Første Skak på Nobara/Fedora Linux (HTPC)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALL_DIR="${INSTALL_DIR:-$PROJECT_DIR}"
PORT="${SKAK_PORT:-3002}"
SERVICE_NAME="skak"
USER_NAME="${SUDO_USER:-$USER}"

echo "==> Installer Min Første Skak"
echo "    Mappe: $INSTALL_DIR"
echo "    Port:  $PORT"

install_packages() {
  if command -v dnf &>/dev/null; then
    echo "==> Installerer systempakker (Nobara/Fedora)..."
    sudo dnf install -y nodejs npm chromium || true
  elif command -v apt &>/dev/null; then
    echo "==> Installerer systempakker (Debian/Ubuntu)..."
    sudo apt update
    sudo apt install -y nodejs npm chromium-browser || sudo apt install -y nodejs npm chromium || true
  else
    echo "==> Ingen dnf/apt fundet – springer systempakker over"
  fi
}

if ! command -v node &>/dev/null; then
  install_packages
fi

if ! command -v node &>/dev/null; then
  echo "Fejl: Node.js er ikke installeret. Installer nodejs og kør scriptet igen."
  exit 1
fi

if ! command -v pnpm &>/dev/null; then
  echo "==> Installerer pnpm..."
  npm install -g pnpm
fi

cd "$INSTALL_DIR"

if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env
  else
    echo "GEMINI_API_KEY=din_api_key_her" > .env
  fi
  echo "==> Oprettet .env – husk at sætte GEMINI_API_KEY!"
fi

echo "==> Installerer afhængigheder..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "==> Bygger app..."
pnpm run build

PNPM_PATH="$(command -v pnpm)"
NODE_PATH="$(command -v node)"

mkdir -p "$HOME/.config/systemd/user"

cat > "$HOME/.config/systemd/user/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Min Første Skak (HTPC)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
ExecStart=${PNPM_PATH} run preview:htpc
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable "${SERVICE_NAME}.service"
systemctl --user restart "${SERVICE_NAME}.service"

echo ""
echo "✅ Skak-appen kører på http://localhost:${PORT}"
echo ""
echo "Nyttige kommandoer:"
echo "  systemctl --user status ${SERVICE_NAME}"
echo "  systemctl --user restart ${SERVICE_NAME}"
echo "  journalctl --user -u ${SERVICE_NAME} -f"
echo ""
echo "Kiosk-tilstand (fuldskærm):"
echo "  ./scripts/skak-kiosk.sh"
echo ""
echo "Husk at tilslutte en controller og trykke en knap,"
echo "så browseren registrerer gamepad-input."
