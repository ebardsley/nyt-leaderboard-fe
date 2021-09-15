#!/bin/bash

set -e

cd "$(dirname "$0")"
pushd ../nytxw/
./leaderboards.sh

direnv exec . ./aggregate.py ../nyt-leaderboard-fe/src/nytxw-combined.json *.pson

popd
npm run build
s3cmd -P -F --delete-removed sync ./out/ s3://nytxw.sigmanuds.org/
