#!/usr/bin/sh

RELEASE_BRANCH=release/$(git semver next)

git checkout -b $RELEASE_BRANCH
git semver bump -f version.ts:version -f gh-releaser:tag
git push -u origin $RELEASE_BRANCH
