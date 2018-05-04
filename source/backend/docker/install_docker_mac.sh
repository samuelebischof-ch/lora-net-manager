#!/bin/bash

echo Downloading docker...
curl -o Docker.dmg https://download.docker.com/mac/stable/Docker.dmg
  
VOLUME=$(hdiutil attach ./Docker.dmg | tail -1 | awk '{print $3}')
cp -r "$VOLUME/"*.app /Applications/
diskutil unmount "$VOLUME"
open /Applications/Docker.app
rm -f ./Docker.dmg
