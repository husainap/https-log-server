## https-log-server
https log server with self signed certificate.

# Install
npm install --prefix=./ --reg=https://registry.npmjs.org/ https-log-server@latest

# Usage
* Server Start (with default options)
### npm  start
log server will start with default port 9443 and default log directory as the current install directory.
* Server Start with port and directory command line options
### npm  start -- --port 5000 --dir /Users/Husain/Desktop/

Server can be started using node command after changing the directory to the https-log-server npm installed directory.
node https-log-server -p port -d path
-p port : port number on which log server should listen (by default 9443)
-d path : path at which logs recived will get saved. if not specified logs recived will be saved on the current working diretory where the log server executes.

# Sending logs to the log server
Client should POST the log messages to the log server.
URL of the POST is  https://server-ip:port/LOGFILENAME/log
LOGFILENAME : is name of the log file that is being created on the server
example: https://192.168.2.30:9443/ConsoleLogs/log
 
Log server will create a file with name as "ConsoleLogs.log". This log file will be in folder with name as date of the file creation (eg:2017-9-15)
