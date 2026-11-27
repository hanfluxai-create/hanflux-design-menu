#!/usr/bin/env bash
# Hanflux premium film templates: cut a raw film into the webp frames the scroll plays. No video file ships.
# Usage: tools/premium/encode.sh <slug> <name> <raw-16x9.mp4|-> <raw-9x16.mp4|-> [frames=96] [trim-start s=0] [trim-end s=0]
#   <name> is the folder under w/<slug>/: "film" for the hero film, anything else for a section film.
#   "-" skips that cut (a section film can be laptop-only; the kit then uses the d set on phones too).
# Writes w/<slug>/<name>/d/001.webp.. (1280x720), m/001.webp.. (540x960, a real vertical cut) and still-d.webp, still-m.webp.
set -euo pipefail
slug=$1; name=$2; rd=$3; rm_=$4; n=${5:-96}; t0=${6:-0}; t1=${7:-0}
root=$(cd "$(dirname "$0")/../.." && pwd); out="$root/w/$slug/$name"
cutf() { # file dir size quality still
  [ "$1" = "-" ] && return 0
  mkdir -p "$out/$2"; rm -f "$out/$2"/*.webp
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  local len; len=$(python3 -c "print(max(0.5, $dur - $t0 - $t1))")
  ffmpeg -v error -y -ss "$t0" -t "$len" -i "$1" -an -vf "fps=$n/$len,scale=$3:force_original_aspect_ratio=increase:flags=lanczos,crop=$3,setsar=1" -frames:v "$n" -c:v libwebp -quality "$4" -compression_level 6 -preset photo "$out/$2/%03d.webp"
  ffmpeg -v error -y -ss "$t0" -i "$1" -an -vf "scale=$3:force_original_aspect_ratio=increase:flags=lanczos,crop=$3,setsar=1" -frames:v 1 -c:v libwebp -quality 80 "$out/still-$2.webp"
}
cutf "$rd" d 1280:720 50
cutf "$rm_" m 540:960 54
echo "$slug/$name: d=$(ls "$out/d" 2>/dev/null | wc -l) m=$(ls "$out/m" 2>/dev/null | wc -l) $(du -sh "$out" | cut -f1)"
