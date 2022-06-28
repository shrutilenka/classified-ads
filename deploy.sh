#!/bin/bash

echo "pulling"
git pull

echo "Building application"
sudo docker compose up --build
sudo docker pull ghcr.io/mikecao/umami:postgresql-latest