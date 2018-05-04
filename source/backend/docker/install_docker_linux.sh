#!/bin/bash

curl -fsSL get.docker.com -o get-docker.sh
chmod +x ./get-docker.sh
sh get-docker.sh
rm get-docker.sh