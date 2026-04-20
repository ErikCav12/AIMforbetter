#!/usr/bin/env bash
# Regenerate the CSS bundle and sync the cache-bust version across every
# HTML page for both the CSS bundle and the JS bundle. Run after any
# source CSS or JS change.
#
# Usage: scripts/bump-cache.sh

set -euo pipefail

cd "$(dirname "$0")/.."

# 1. Regenerate the CSS bundle.
cat \
  css/base.css \
  css/nav.css \
  css/components.css \
  css/animations.css \
  css/homepage.css \
  css/backstory.css \
  css/evidence.css \
  css/solutions.css \
  css/syllabus.css \
  css/modules.css \
  css/contact.css \
  > css/bundle.css

# 2. Pick a single new version (current epoch) and apply to every page.
VERSION="$(date +%s)"

find index.html pages -name '*.html' -type f -print0 | \
  xargs -0 sed -i '' -E \
    -e "s|bundle\.css\?v=[0-9]+|bundle.css?v=${VERSION}|g" \
    -e "s|bundle\.js\?v=[0-9]+|bundle.js?v=${VERSION}|g"

echo "Bundle regenerated. Cache-bust set to v=${VERSION} on all pages."
