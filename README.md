# https-log-server
https log server with self signed certificate.

## Installation
Follow below steps for installing the  **https-log-server** on local machine.
1. Please install [**nodejs**](https://nodejs.org/) if it is not installed.
2. Open terminal program (Mac) or CMD program (Windows)
3. Change directory to the desired directory where **https-log-server** gets installed.
3. Check **nodejs** version by typing below command<br>
   "**_node -v_**"<br>
4. Install **https-log-server** by typing below command on command prompt.<br>
   **_npm install --prefix=./ --registry=https:<i></i>//registry.npmjs.org/ https-log-server@latest_**

## Server Start
Follow below steps for starting the  **https-log-server** on local machine.
1. Open terminal program (Mac) or CMD program (Windows)
2. Change directory to **https-log-server** installed directory (**Refer above Installation Step 5**)
3. Type  below command to start the **https-log-server**  with default port number and log path.<br>
   **_npm  start_**<br>
   Description: **https-log-server** will start with default port **9443** and default log directory as the **https-log-server** installation directory.
4. Type below command to start the **https-log-server**  with specific port number and log path.<br>
   **_npm  start -- --port port_number --dir path_**<br>
   eg: **_npm  start -- --port 5000 --dir /Users/Husain/Desktop/_**<br>

**https-log-server** can also be started using node command after changing the directory to the  **https-log-server** installed directory.<br>
**_node https-log-server -p port -d path_**<br>
-p port : port number on which log server should listen (by default **9443**)<br>
-d path : path at which logs received will get saved. If not specified logs received will be saved on the current working directory where the **https-log-server** runs.

## Server Stop
Press Ctrl+c

## Sending logs to the log server
Client should POST the log messages to the log server.
<br>URL of the POST is  https://<i></i>server-ip:port/**LOGFILENAME**/log
<br>**LOGFILENAME** : is name of the log file that is being created on the server under folder with name as the date of the day.
<br>example: **https://<i></i>192.168.2.30:9443/ConsoleLogs/log**

<br>Log server will create a file with name as "ConsoleLogs.log".
<br>This log file will be in folder with name as date of the file creation (eg:2017-9-15)
