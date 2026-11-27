#!/usr/bin/env bash
# Hanflux premium film templates: turn the two raw Seedance cuts into what a template ships.
# Usage: tools/premium/encode.sh <slug> <raw-16x9.mp4> <raw-9x16.mp4> [desktop frames=72] [phone frames=48]
# Writes w/<slug>/film/: film-d.mp4, film-m.mp4 (H.264, yuv420p, short GOP, faststart, no audio; the phone one is lighter),
# d/001.webp.., m/001.webp.. (the scroll frames, taken from the encoded files) and still-d.webp, still-m.webp (first frames).
set -euo pipefail
slug=$1; rd=$2; rm_=$3; nd=${4:-72}; nm=${5:-48}
root=$(cd "$(dirname "$0")/../.." && pwd); out="$root/w/$slug/film"
mkdir -p "$out/d" "$out/m"; rm -f "$out"/d/*.webp "$out"/m/*.webp
ffmpeg -v error -y -i "$rd" -an -vf "scale=1280:720:flags=lanczos,setsar=1" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -g 12 -keyint_min 12 -sc_threshold 0 -movflags +faststart "$out/film-d.mp4"
ffmpeg -v error -y -i "$rm_" -an -vf "scale=540:960:flags=lanczos,setsar=1" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -g 12 -keyint_min 12 -sc_threshold 0 -movflags +faststart "$out/film-m.mp4"
frames() { # file dir count quality
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  ffmpeg -v error -y -i "$1" -vf "fps=$3/$dur" -frames:v "$3" -c:v libwebp -quality "$4" -compression_level 6 "$2/%03d.webp"
}
frames "$out/film-d.mp4" "$out/d" "$nd" 60
frames "$out/film-m.mp4" "$out/m" "$nm" 58
ffmpeg -v error -y -i "$out/film-d.mp4" -frames:v 1 -c:v libwebp -quality 80 "$out/still-d.webp"
ffmpeg -v error -y -i "$out/film-m.mp4" -frames:v 1 -c:v libwebp -quality 80 "$out/still-m.webp"
echo "$slug: d=$(ls "$out/d" | wc -l) m=$(ls "$out/m" | wc -l) $(du -sh "$out" | cut -f1)"
