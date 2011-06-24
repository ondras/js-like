set app=c:\programs\jsdoc-toolkit
java -jar "%app%\jsrun.jar" "%app%\app\run.js" -a -t="%app%\templates\jsdoc" -d=doc -v ../js/rpg/*.js ../js/library/*.js ../js/ui/*.js ../js/story/*.js
