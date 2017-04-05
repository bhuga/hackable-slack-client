#!/bin/sh

NEXT_VERSION=$1

if [ -z "$NEXT_VERSION" ] ; then
  echo "usage: $0 <next_version>"
  exit 1
fi

VERSION=`cat app/package.json | jq -r '.version'`

echo "replacing $VERSION with $NEXT_VERSION"

sed -i "s/$VERSION/$NEXT_VERSION/" app/package.json
sed -i "s/$VERSION/$NEXT_VERSION/" README.md
git diff
