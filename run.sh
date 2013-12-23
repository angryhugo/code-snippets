#! /bin/bash

PORT=12344

case $1 in
    dev)
        npm i
        supervisor ./app/app.js
    ;;
    debug)
        npm i
        supervisor --debug ./app/app.js
    ;;
    -help|*)
        echo "Params: {dev | debug | -help}"
        exit 1
    ;;
esac
