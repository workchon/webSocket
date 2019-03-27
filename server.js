var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var http = require('http');
var httpServer = http.Server(app);
var SocketIOFile = require('socket.io-file');
var fs = require("fs");
var path = require('path');
var bodyParser = require('body-parser')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

users = [];
connection = [];

server.listen(process.env.PORT || 3000);
console.log('Server runnig-..');

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});
app.get('/app.js', (req, res, next) => {
    return res.sendFile(__dirname + '/app.js');
});
//Get para descargar archivos en la pagina
app.get('/Archivos',function(req,res){
   
    var file=__dirname+'/data/'+req.query.archivo;
    res.download(file);
    
});
app.get('/socket.io.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});

app.get('/socket.io-file-client.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

io.sockets.on('connection', function(socket) {



    connection.push(socket);
    console.log('Connected: %s socket connected', connection.length);

    //desconeccion
    socket.on('disconnect', function(data) {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connection.splice(connection.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connection.length);
    });

    //Enviar Mensajes
    socket.on('send message', function(data) {
        io.sockets.emit('new message', { msg: data });
    });

    //nuevo usuario
    socket.on('new user', function(data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();

    });
    var uploader = new SocketIOFile(socket, {
        // uploadDir: {			// multiple directories
        // 	music: 'data/music',
        // 	document: 'data/document'
        // },
        uploadDir: 'data', // simple directory
         // chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
         // 4 MB. default is undefined(no limit)
         // default is 10240(1KB)
        transmissionDelay: 0, // delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
        overwrite: true // overwrite file if exists, default is true.
    });
    uploader.on('start', (fileInfo) => {
        console.log('Start uploading');
        console.log(fileInfo);
    });
    uploader.on('stream', (fileInfo) => {
        console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
    });
    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.');
        console.log(fileInfo);
    });
    uploader.on('error', (err) => {
        console.log('Error!', err);
    });
    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo);
    });

    function updateUsernames() {
        io.sockets.emit('get users', users);
    }
   

});