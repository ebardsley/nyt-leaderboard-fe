#!/bin/bash

set -e

cd "$(dirname "$0")"
pushd ../nytxw/
  if [[ -z "${AGG_ONLY:-}" ]]; then ./leaderboards.sh; fi
  direnv exec . ./aggregate.py ../nyt-leaderboard-fe/src/nytxw-combined.json 'data/**/*.pson'
popd

# To setup fresh node_modules, run the same command w/ "npm install".
docker run --rm -e NEXT_TELEMETRY_DISABLED=1 \
  -v $PWD:/nyt-leaderboard-fe -w /nyt-leaderboard-fe \
  node:latest \
  npm run build

s3cmd -F --delete-removed sync ./out/ s3://nytxw.sigmanuds.org/
