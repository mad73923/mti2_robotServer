var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

var port = 8080;
var robotServer;

var exports = module.exports = {};
var server;

router.use(function (req,res,next) {
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/UIscript.js",function(req,res){
  res.sendFile(path + "UIscript.js");
});

router.get("/clients.json", function(req, res){
	res.send(robotServer.getClientData());
});

router.get("/node_modules/*", function(req, res){
	res.sendFile(__dirname + req.url);
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

exports.startServer = function(pRobotServer){
	robotServer = pRobotServer;
	console.log("Start UI-Server at localhost:"+port);
	server = app.listen(port,function(){
	  console.log("UI-Server started!");
	});
};

exports.stopServer = function(){
	console.log("Stopping UI-Server!");
	server.close();
}
