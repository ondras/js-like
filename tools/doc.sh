#!/bin/sh

APP=`readlink -f ~/jsdoc-toolkit`
java -jar "${APP}/jsrun.jar" "${APP}/app/run.js" -a -t="${APP}/templates/jsdoc" -d=doc -v ../js/rpg/*.js ../js/library/*.js
