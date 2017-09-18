## https-log-server
https log server with self signed certificate.

#Install
npm install https-log-server

##Usage
#Server Start:
nod https-log-server -p port -d path
-p port : port number on which log server should listen (by default 9443)
-d path : path at which logs recived will get saved. if not specified logs recived will be saved on the current working diretory where the log server executes.

#Sending logs to the log server
Client should POST the log messages to the log server.
URL of the POST is  https://server-ip:port/LOGFILENAME/log
LOGFILENAME : is name of the log file that is being created on the server
example: https://192.168.2.30:9443/ConsoleLogs/log
 
Log server will create a file with name as "ConsoleLogs.log". This log file will be in folder with name as date of the file creation (eg:2017-9-15)



Clinet
