#!/usr/bin/env bash
set -euo pipefail

echo "==> Running tests..."
npm test

echo "==> Logging in to npm..."
npm login

echo "==> Building and publishing..."
npm run build && npm publish --access public
