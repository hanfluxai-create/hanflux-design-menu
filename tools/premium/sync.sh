#!/usr/bin/env bash
# Copy the shared kit into every premium template folder (each demo stays self-contained).
set -euo pipefail
root=$(cd "$(dirname "$0")/../.." && pwd)
for s in chrono atrium ember shore core totem; do
  [ -d "$root/w/$s" ] && cp "$root/tools/premium/kit.js" "$root/tools/premium/kit.css" "$root/w/$s/"
done
