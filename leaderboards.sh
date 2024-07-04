#!/bin/bash

set -e

cd "$(dirname "$0")"
pushd ../nytxw/
  if [[ -z "${AGG_ONLY:-}" ]]; then ./leaderboards.sh; fi
  sources=('data/**/*.pson')
  if id syncthing > /dev/null 2>&1; then
    sources+=($(getent passwd syncthing | cut -d: -f6)'/nytxw-manual/*.pson')
  fi
  direnv exec . ./aggregate.py ../nyt-leaderboard-fe/src/nytxw-combined.json "${sources[@]}"
popd

# To setup fresh node_modules, run the same command w/ "npm install".
docker run --rm -e NEXT_TELEMETRY_DISABLED=1 \
  -v $PWD:/nyt-leaderboard-fe -w /nyt-leaderboard-fe \
  node:latest \
  npm run build

s3cmd -F --delete-removed sync ./out/ s3://nytxw.sigmanuds.org/
