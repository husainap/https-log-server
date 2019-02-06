var lodash = require('lodash');
var colors = require('colors');
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var queue   = require("q");
var os = require( 'os' );
var selfSigned = require('openssl-self-signed-certificate');
var fse = require('fs-extra');
/**
 *
 * Get the log file name
 *
 * @return {String}
 *
 */
var getLogDirectory = function(baseDir){
    if(!baseDir && typeof(baseDir)!="string" ){
        throw new Error("Base Log dir is required!");
    }
    /// calculate the log file name
    var date = new Date();
    var dirPath = lodash.template("<%= baseDir %>/<%= year %>-<%= month %>-<%= day %>")(
        { year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate(), baseDir: baseDir });
    /// auto create directories
    if (!fs.existsSync(baseDir)){
        fs.mkdirSync(baseDir);
    }
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }
    return dirPath;
};
/**
 *
 * Get the log file name
 *
 * @return {String}
 *
 */
var getLogFilename = function(logdir, name){

    if(!name && typeof(name)!="string" ){
        throw new Error("Log name is required!");
    }

    /// calculate the log file name
    return lodash.template("<%= dir %>/<%= filename %>.log")({ dir: logdir, filename: name });

};
/**
 *
 * Log file
 *
 * @param {String} name
 *
 */
var Log = function(baseLogDir, name){
    /// get the base log dir
    baseLogDir = getLogDirectory(baseLogDir);
    /// get the log filename
    name = getLogFilename(baseLogDir, name);
    var self = {
        /**
         *
         * Write the buffer into the log file
         *
         * @param  {Buffer} buffer
         * @return {Promise}
         *
         */
        write: function(buffer){
            var dfd = queue.defer();
            fs.appendFile(name, buffer, function(err){
                if(err) dfd.reject(err);
                else    dfd.resolve();
            });
            return dfd.promise;
        }
    };
    return self;
};

var Dump = function(baseLogDir, fileName){
    baseLogDir =   getLogDirectory(baseLogDir);
    var self = {
         name :  baseLogDir + '/' +fileName,
        /**
         *
         * Write the buffer into the dump file
         *
         * @param  {Buffer} buffer
         * @return {Promise}
         *
         */
        write: function(req){
            var name = this.name;
            //console.log('dump file name=', name );
            var size = 0;
            //console.log("content-type: ", req.headers['content-type']);
            //console.log("content-length: ", req.headers['content-length']);
            var dfd = queue.defer();
            if(req.body && req.body.length ) {
                fse.outputFile(name, req.body, (err) => {
                   err ? dfd.reject(err): dfd.resolve();
                });
            } else {
                var body = [];
                req.on('data', (data) => {
                    //console.log('data=', data);
                    body.push(data);
                    size += data.length;
                });

                req.on('end', () => {
                    //console.log("total size = " + size);
                    body = Buffer.concat(body);
                    fse.outputFileSync(name, body);
                    dfd.resolve();
                });
            }
            return dfd.promise;
        }
    };
    return self;
};

var simpleargs  = require('simpleargs');
var bodyParser  = require('body-parser');
var path        = require('path');
var serveIndex  = require('serve-index');
var serveStatic = require('serve-static');

simpleargs
    .define('p','port', null, 'Port number')
    .define('d','dir', null, 'Logs directory')
    .define('s','https', null, 'https or http server')
    .define('c','cert', null, 'https ssl cert file path')
    .define('k','key', null, 'https ssl key file path')
    .define('e','password', null, 'https ssl password file path');

var httpsPort = 9443;
var httpPort = 9000;
var pwd = process.cwd();
var sslCert = {key: '',
               cer: '',
               passphrase: ''};

var options = simpleargs(process.argv.slice(2));
if(!options.port) {
    options.port = httpsPort;
}
if(!options.dir) {
    options.dir = pwd;
}
options.dir = path.resolve(options.dir);

if(options.cert && options.key) {
    options.key =  path.resolve(options.dir, '../..', options.key);
    options.cert =  path.resolve(options.dir, '../..', options.cert);

    if(!fs.existsSync(options.key) || !fs.existsSync(options.cert)) {
        console.log("SSL key and cert files does not exist");
        process.exit(0)
    }
    sslCert.key =  fs.readFileSync(options.key, 'utf8');
    sslCert.cert =  fs.readFileSync(options.cert, 'utf8');
    if(options.password) {
        options.password = path.resolve(options.dir, '../..', options.password);
        if(!fs.existsSync(options.key)){
            console.log("SSL password files does not exist");
            process.exit(0)
        }
        sslCert.passphrase = fs.readFileSync(options.password,'utf8');
    }
} else {
  sslCert.key = selfSigned.key;
  sslCert.cert = selfSigned.cert,
}


console.log("Starting log-server at port: ".green + (""+options.port).red + " log directory ".green +  (""+options.dir).red);

/// Initalize filesystem
if (!fs.existsSync(options.dir)){
    console.log('options.dir ', options.dir ,' does not exist. so creating');
    fs.mkdirSync(options.dir);
}

var app = express();
// parse text/plain
app.use(bodyParser.raw({type: 'text/plain', limit: 1024 * 1024 * 10 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});


app.post('/:id/log/', function(req, res){
    var logName = req.params.id;
    Log(options.dir, logName)
        .write(req.body)
        .then(function(){
            res.send();
        });
});

app.post('/dump/*', function(req, res){
    var dumpName = req.url.substr('/dump/'.length);
    Dump(options.dir, dumpName)
       .write(req)
       .then(function(){
            res.send();
       });
});


app.get('/*', serveIndex(options.dir, { icons: true, view: 'details' }));
app.get('/*.log', serveStatic(options.dir, { icons: true }));
app.get('/*/*', serveStatic(options.dir, { icons: true }));

var sslOptions = {
    key: sslCert.key,
    cert: sslCert.cert,
    passphrase : sslCert.passphrase
};

var httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(options.port);
/*console.log(
    lodash.template("https://<%= host %>:<%= port %>".yellow)({ host: ip.address(),port: options.port }));
*/

var getServerIp = function () {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    var values = Object.keys(ifaces).map(function(name) {
        return ifaces[name];
    });
    values = [].concat.apply([], values).filter(function(val){
        return val.family == 'IPv4' && val.internal == false;
    });

    return values.length ? values[0].address : '0.0.0.0';
};
var ipAddress=getServerIp();
if(options.cert && options.key) {
    ipAddress = ipAddress.split('.').join('-').concat('-ip.dishboxes.com');
} else {
    ipAddress = 'localhost';
}
console.log(
    lodash.template("https://<%= host %>:<%= port %>".yellow)({ host: ipAddress,port: options.port }));






