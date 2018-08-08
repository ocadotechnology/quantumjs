#!/bin/bash
maybe_get_tag () {
  if [ "$2" != "$3" ]
  then
    echo "git tag -a $1-$2 -m ''"
  fi
}

get_tag_for_package () {
  LOCAL_VERSION=$(node -p -e "require('./$1/package.json').version")
  PUBLISHED_VERSION=$(npm show $1 version)
  maybe_get_tag $1 $LOCAL_VERSION $PUBLISHED_VERSION
}

echo "Tags Required:"
get_tag_for_package 'quantum-api'
get_tag_for_package 'quantum-code-highlight'
get_tag_for_package 'quantum-core'
get_tag_for_package 'quantum-diagram'
get_tag_for_package 'quantum-docs'
get_tag_for_package 'quantum-dom'
get_tag_for_package 'quantum-html'
get_tag_for_package 'quantum-markdown'
get_tag_for_package 'quantum-template'
get_tag_for_package 'quantum-version'
echo "End Required Tags"
