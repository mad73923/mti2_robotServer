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

// Socket handler

function findSocket(element, index, array){
	return element.socket === this;
}

var connectionListener = function (socket){
	console.log("New client connected, checking validity...");
	socket.write("getUID");

	socket.on('data', (dataIn)=>{
		//console.log("RX data:"+dataIn);
		var knownSocket = clients.find(findSocket, socket);
		if(knownSocket==undefined){
			checkValidClient(dataIn, socket);
		}else{
			knownSocket.next(dataIn, knownSocket);
		}
	});

	socket.on('close', ()=>{
		console.log("Connection to Client closed.");
		var index = clients.findIndex(findSocket, socket);
		if(index != -1){
			clients.splice(index,1);
		}
	});
};

// Answer handler

var checkValidClient = function(answer, socket){
	var validUID = /\d\d:\d\d:\d\d:\d\d/;
	if(String(answer).match(validUID)!=null){
		console.log("Client valid!");
		clients.push({
			socket: socket,
			next: 	unexpectedAnswer
		});
	}else{
		console.log("Client not valid!");
		socket.end();
	}
};

var unexpectedAnswer = function(answer, socketBundle){
	console.log("Unexpected Answer:"+answer);
};

function ActPos(answer, socketBundle){
	socketBundle.next = unexpectedAnswer;
}

// Commands

var getPos = function(socketBundle){
	socketBundle.next = ActPos;
	socketBundle.socket.write("GetPos?");
};

// Update data
var updateData = function(){
	clients.forEach(function(item){
		getPos(item);
	});
};
