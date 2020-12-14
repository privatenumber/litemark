#!/usr/bin/env sh

set -e

npm run build

cd dist

git init
git add -A
git commit -m 'chore: deploy'

git push -f git@github.com:privatenumber/litemark.git master:gh-pages

cd -
