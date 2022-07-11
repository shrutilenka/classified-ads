#!/bin/bash

#echo "pulling"
#git pull

echo "Building application"
sudo docker compose up -d --build
