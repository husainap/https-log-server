var lodash = require('lodash');
var colors = require('colors');
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var queue   = require("q");
var selfSigned = require('openssl-self-signed-certificate');
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



var simpleargs  = require('simpleargs');
var bodyParser  = require('body-parser');
var path        = require('path');
var serveIndex  = require('serve-index');
var serveStatic = require('serve-static');
//var ip = require("ip");

simpleargs
    .define('p','port', null, 'Port number')
    .define('d','dir', null, 'Logs directory')
    .define('s','https', null, 'https or http server');

var httpsPort = 9443;
var httpPort = 9000;
var pwd = process.cwd();

var options = simpleargs(process.argv.slice(2));
if(!options.port) {
    options.port = httpsPort;
}
if(!options.dir) {
    options.dir = pwd;
}
options.dir = path.resolve(options.dir);

console.log("Starting log-server at port: ".green + (""+options.port).red + " log directory ".green +  (""+options.dir).red);

/// Initalize filesystem
if (!fs.existsSync(options.dir)){
    console.log('options.dir ', options.dir ,' does not exist. so creating');
    fs.mkdirSync(options.dir);
}

var app = express();
// parse text/plain
app.use(
    bodyParser.raw({ type: 'text/plain', limit: 1024 * 1024 * 10 }));

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

app.get('/*', serveIndex(options.dir, { icons: true, view: 'details' }));
app.get('/*.log', serveStatic(options.dir, { icons: true }));

var sslOptions = {
    key: selfSigned.key,
    cert: selfSigned.cert
};

var httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(options.port);
/*console.log(
    lodash.template("https://<%= host %>:<%= port %>".yellow)({ host: ip.address(),port: options.port }));
*/
console.log(
    lodash.template("https://<%= host %>:<%= port %>".yellow)({ host: 'localhost',port: options.port }));






