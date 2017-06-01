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
};

function connectionListener(socket){
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
		console.log("Connection to client closed.");
		var index = clients.findIndex(findSocket, socket);
		if(index != -1){
			console.log("Deleted client UID:"+clients[index].uid);
			clients.splice(index,1);
		}
	});
};

// Answer handler

function checkValidClient(answer, socket){
	var validUID = /\d\d:\d\d:\d\d:\d\d/;
	if(String(answer).match(validUID)!=null){
		console.log("Client valid! UID:"+answer);
		clients.push({
			socket: socket,
			next: 	unexpectedAnswer,
			uid: 	answer
		});
	}else{
		console.log("Client not valid!");
		socket.end();
	}
};

function unexpectedAnswer(answer, socketBundle){
	console.log("Unexpected Answer:"+answer);
};

function ActPos(answer, socketBundle){
	socketBundle.next = unexpectedAnswer;
};

// Commands

function getPos(socketBundle){
	socketBundle.next = ActPos;
	socketBundle.socket.write("GetPos?");
};

// Update data
function updateData(){
	clients.forEach(function(item){
		getPos(item);
	});
};
