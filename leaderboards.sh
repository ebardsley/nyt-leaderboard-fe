#!/bin/bash

set -e

cd "$(dirname "$0")"
if [[ -z "${AGG_ONLY:-}" ]]; then
  pushd ../nytxw/
  ./docker-cron.sh
  popd
  cp ../nytxw/data/nytxw-combined.json src/
fi

# Done by docker-cron already.
#direnv exec . ./aggregate.py ../nyt-leaderboard-fe/src/nytxw-combined.json 'data/**/*.pson'

# To setup fresh node_modules, run the same command w/ "npm install".
docker run --rm -e NEXT_TELEMETRY_DISABLED=1 \
  -v $PWD:/nyt-leaderboard-fe -w /nyt-leaderboard-fe \
  node:latest \
  npm run build

s3cmd -P -F --delete-removed sync ./out/ s3://nytxw.sigmanuds.org/
