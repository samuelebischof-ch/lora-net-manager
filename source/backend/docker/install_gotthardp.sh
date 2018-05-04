#!/bin/bash

# First install docker from https://docs.docker.com

PWD=$(pwd)/data:/storage

docker pull gotthardp/lorawan-server:latest

docker run -d \
  --name lorawan \
  --hostname lorawan \
  --net="bridge" \
  --volume $PWD \
  --publish 8080:8080/tcp \
  --publish 1883:1883/tcp \
  --publish 3001:3000 \
  --publish 1680:1680/udp \
gotthardp/lorawan-server:latest