var port = 2323;

var net = require('net');

var clients = new Array();

console.log("Start Robot-Server at localhost:"+port);

var server = net.createServer(function(socket){
	connectionListener(socket);
});

server.listen(port, '127.0.0.1', function(){
	console.log("Server started!");
});

// Intervall function

var timer = setInterval(()=>{
	updateData();
}, 500);

var nextAnswerCallback = unexpectedAnswer;

var connectionListener = function (socket){
	console.log("New client connected, checking validity...");
	socket.write("getUID");
	nextAnswerCallback = checkValidClient;

	socket.on('data', (dataIn)=>{
		console.log("RX data:"+dataIn);
		nextAnswerCallback(dataIn, socket);
	});

	socket.on('close', ()=>{
		console.log("Connection to Client closed.");
		clients.splice(clients.indexOf(socket));
	});
};

// Answer handler

var unexpectedAnswer = function(answer, socket){
	console.log("Unexpected Answer:"+answer);
};

var checkValidClient = function(answer, socket){
	var validUID = /\d\d:\d\d:\d\d:\d\d/;
	if(String(answer).match(validUID)!=null){
		console.log("Client valid!");
		clients.push(socket);
	}else{
		console.log("Client not valid!");
		socket.end();
	}
	nextAnswerCallback = unexpectedAnswer;
};

// Commands

var getPos = function(client){
	client.write("GetPos?");
};

// Update data
var updateData = function(){
	clients.forEach(function(item){
		getPos(item);
	});
};
