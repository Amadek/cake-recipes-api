#!/bin/bash
set -e

if [ "$NODE_ENV" = "dev" ]
then
  exec npx nodemon "dist/index.js"
else
  exec node "dist/index.js"
fi
