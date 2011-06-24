#!/bin/sh

APP=`readlink -f ~/jsdoc-toolkit`
java -jar "${APP}/jsrun.jar" "${APP}/app/run.js" -a -t="${APP}/templates/jsdoc" -d=doc -v -r=2 ../js/rpg ../js/library ../js/ui ../js/story
