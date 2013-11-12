#! /bin/bash

PORT=10101

case $1 in
    dev)
        npm i
        node ./app/app.js
    ;;
    debug)
        npm i
        node --debug ./app/app.js
    ;;
    -help|*)
        echo "Params: {start | debug | -help}"
        exit 1
    ;;
esac
