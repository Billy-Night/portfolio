#!/bin/bash
# usage: screenshots.sh <outdir> [width] [height] [dist-dir]  — serve a build, screenshot every page, list console errors
OUT=$1; W=${2:-1280}; H=${3:-2600}; DISTDIR=${4:-dist}
cd "$(dirname "$0")/../.."
mkdir -p "$OUT"
python3 -m http.server 4599 --directory "$DISTDIR" >/dev/null 2>&1 &
SRV=$!; sleep 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in $(cd "$DISTDIR" && find . -name '*.html' | sed 's|^\./||' | sort); do
  name=$(echo "$f" | sed 's|/|_|g; s|\.html$||')
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$OUT/.profile" \
    --window-size=$W,$H --virtual-time-budget=6000 --enable-logging=stderr --v=0 \
    --screenshot="$OUT/$name.png" "http://localhost:4599/$f" 2> "$OUT/$name.log"
  errs=$(grep -E 'CONSOLE.*(Uncaught|Error|Failed to load|404)' "$OUT/$name.log" | sed -E 's/^.*CONSOLE\([0-9]+\)\] //' | sort -u)
  echo "== $f $( [ -f "$OUT/$name.png" ] && echo '[screenshot ok]' || echo '[NO SCREENSHOT]')"
  [ -n "$errs" ] && echo "$errs" | cut -c1-260 | sed 's/^/     /'
done
kill $SRV 2>/dev/null
rm -rf "$OUT/.profile"
