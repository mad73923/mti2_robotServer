var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// io server
io.on('connection', function(socket){
  console.log('io: a user connected');

  socket.on('disconnect', function(){
    console.log('io: user disconnected');
  });
});

var path = __dirname + '/views/';

var port = 8080;
var robotServer;

var exports = module.exports = {};
var server;

app.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

app.get("/UIscript.js",function(req,res){
  res.sendFile(path + "UIscript.js");
});

app.get("/clients.json", function(req, res){
	res.send(robotServer.getClientData());
});

app.get("/node_modules/*", function(req, res){
	res.sendFile(__dirname + req.url);
});

app.use("*",function(req,res){
	console.log(req);
  res.sendFile(path + "404.html");
});

exports.startServer = function(pRobotServer){
	robotServer = pRobotServer;
	console.log("Start UI-Server at localhost:"+port);
	server = http.listen(port,function(){
	  console.log("UI-Server started!");
	});
};

exports.stopServer = function(){
	console.log("Stopping UI-Server!");
	server.close();
}
