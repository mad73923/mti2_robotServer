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

var connectionListener = function (socket){
	console.log("New client connected, checking validity...");
	socket.write("getUID");

	socket.on('data', (dataIn)=>{
		console.log("RX data:"+dataIn);
		checkValidClient(dataIn, socket);
	});
};

var checkValidClient = function(answer, socket){
	var validUID = /\d\d:\d\d:\d\d:\d\d/;
	if(String(answer).match(validUID)!=null){
		console.log("Client valid!");
		clients.push(socket);
	}else{
		console.log("Client not valid!");
	}
};
