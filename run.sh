#! /bin/bash

PORT=12344

stop()
{
    PID=`netstat -nlpt | grep ":$PORT" | awk '{split($7,t,"/");print t[1]}'`

    if [ $PID ]
    then
        kill $PID
        wait $!
        return 1
    else
        return 0
    fi
}

case $1 in
    start)
        export NODE_ENV=production
        npm i
        nohup node ./dist/app/app.js &
    ;;
    stop)
        stop

        if [ $? -eq 1 ]
        then
            echo "Server is stopped!"
        else
            echo "Maybe program is stopped ..."
        fi
    ;;
    restart)
        stop

        export NODE_ENV=production
        nohup node ./dist/app/app.js &
        echo "Restart successfully..."
    ;;
    debug)
        npm i
        supervisor --debug ./app/app.js
    ;;
    dev)
        npm i
        supervisor ./app/app.js
    ;;
    build)
        grunt
    ;;
    *)
        echo "Params: {start|stop|debug|build|dev|restart|init|-t}"
        echo "==================================================================\n"
        echo "  default         show help text"
        echo "  start           start project with production environment"
        echo "  stop            stop server"
        echo "  debug           start up server with '--debug'"
        echo "  dev             start up server with development environment"
        echo "  restart         restart server with production environment"
        echo "  build           build"
        exit 1
    ;;
esac
