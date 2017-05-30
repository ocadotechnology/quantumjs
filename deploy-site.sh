#!/bin/bash

npm run link-all
pushd docs

rm -rf public
mkdir public
git clone git@github.com:ocadotechnology/quantumjs.git public

pushd public
git checkout gh-pages
git rm -rf *
popd

export GITHUB_PAGES="true"
npm run build
pushd public
git add .
git commit -m "Site auto-build"
git push
popd

popd
