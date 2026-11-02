#!/usr/bin/env bash
# Runs on the droplet (piped over SSH by the GitHub Actions workflow).
# Unpacks an uploaded build into its own release folder, then atomically
# points the live site at it. Older releases are kept for quick rollback.
#
# Usage: deploy-client.sh <release-id>   (expects /tmp/client-<release-id>.tar.gz)
set -euo pipefail

RELEASE="${1:?Usage: deploy-client.sh <release-id>}"
TARBALL="/tmp/client-${RELEASE}.tar.gz"
BASE="/var/www/chat.suryathink.com"
RELEASES="${BASE}/releases"
KEEP=5

[ -f "$TARBALL" ] || { echo "❌ Missing $TARBALL"; exit 1; }

echo "📦 Unpacking release $RELEASE"
mkdir -p "${RELEASES}/${RELEASE}"
tar -xzf "$TARBALL" -C "${RELEASES}/${RELEASE}"
rm -f "$TARBALL"

[ -f "${RELEASES}/${RELEASE}/index.html" ] || { echo "❌ Build has no index.html"; exit 1; }
chmod -R a+rX "${RELEASES}/${RELEASE}"

echo "🔀 Switching live site"
# Atomic swap: visitors never see a half-copied build
ln -sfn "${RELEASES}/${RELEASE}" "${BASE}/current.tmp"
mv -Tf "${BASE}/current.tmp" "${BASE}/current"

echo "🧹 Keeping the last $KEEP releases"
ls -1dt "${RELEASES}"/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf

echo "✅ Live: $(readlink -f "${BASE}/current")"
