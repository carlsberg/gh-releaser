#!/usr/bin/sh

mkdir bin
deno compile -A --output bin/gh-releaser --target x86_64-unknown-linux-gnu cli/gh-releaser.ts
gh release create $(git semver latest) bin/gh-releaser
rm -rf bin