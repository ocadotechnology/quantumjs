#!/bin/bash

npm run link-all
pushd docs

rm -rf target
mkdir target
git clone git@github.com:ocadotechnology/quantumjs.git target

pushd target
git checkout gh-pages
git rm -rf *
popd

export GITHUB_PAGES="true"
npm run build
pushd target
git add .
git commit -m "Site auto-build"
git push
popd

popd
