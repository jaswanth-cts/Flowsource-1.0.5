#!/bin/bash
# ============================================================
# FlowSource CI/CD - Version Updater Script
# Run this script when a new version of FlowSource is released.
# It updates FlowSourceInstaller/version/version.txt and
# commits the change, which will automatically trigger the
# CodePipeline (build + deploy).
#
# Usage:
#   ./cicd/scripts/update-version.sh 1.0.6
# ============================================================

set -euo pipefail

NEW_VERSION="${1:-}"

if [ -z "${NEW_VERSION}" ]; then
  echo "ERROR: Version argument is required."
  echo "Usage: $0 <new-version>"
  echo "Example: $0 1.0.6"
  exit 1
fi

VERSION_FILE="FlowSourceInstaller/version/version.txt"
CURRENT_VERSION=$(cat "${VERSION_FILE}" | sed 's/image: flowsource://g' | tr -d '[:space:]')

echo "Current version : ${CURRENT_VERSION}"
echo "New version     : ${NEW_VERSION}"
echo ""

read -p "Confirm version update from ${CURRENT_VERSION} to ${NEW_VERSION}? [y/N] " CONFIRM
if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# Update version file
echo "image: flowsource:${NEW_VERSION}" > "${VERSION_FILE}"
echo "Version file updated: ${VERSION_FILE}"

# Git commit and push (triggers CodePipeline automatically)
git add "${VERSION_FILE}"
git commit -m "chore: bump FlowSource version to ${NEW_VERSION} [trigger-pipeline]"
git push

echo ""
echo "=================================================="
echo " Version bumped to ${NEW_VERSION} and pushed."
echo " AWS CodePipeline will trigger automatically."
echo "=================================================="
