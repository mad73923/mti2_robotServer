var port = 2323;

var net = require('net');

var clients = new Array();

console.log("Start Robot-Server at localhost:"+port);

// Server

var server = net.createServer(function(socket){
	connectionListener(socket);
});

server.listen(port, '127.0.0.1', function(){
	console.log("Server started!");
});

// Intervall function

var timer = setInterval(()=>{
	updateData();
}, 2000);

// Socket handler

function findSocket(element, index, array){
	return element.socket === this;
};

function connectionListener(socket){
	console.log("New client connected, checking validity...");
	socket.write("getUID");

	socket.on('data', (dataIn)=>{
		console.log("RX data:"+dataIn);
		var knownSocket = clients.find(findSocket, socket);
		if(knownSocket==undefined){
			checkValidClient(dataIn, socket);
		}else{
			handleAnswer(dataIn, knownSocket);
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

function handleAnswer(answer, socketBundle){
	var next = socketBundle.answerQueue.pop();
	if(next != undefined){
		next(answer, socketBundle);
	}else{
		unexpectedAnswer(answer, socketBundle);
	}
}

function checkValidClient(answer, socket){
	var validUID = /\d\d:\d\d:\d\d:\d\d/;
	if(String(answer).match(validUID)!=null){
		console.log("Client valid! UID:"+answer);
		clients.push({
			socket: socket,
			commandQueue: 	[],
			answerQueue: 	[],
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
	socketBundle.pos = String(answer);
	nextCommand(socketBundle);
};

function ActDistances(answer, socketBundle){
	socketBundle.distances = String(answer);
	nextCommand(socketBundle);
}

function nextCommand(socketBundle){
	var next = socketBundle.commandQueue.pop();
	if(next != undefined){
		next(socketBundle);
	}
}

// Commands

function queueCommand(socketBundle, command, next){
	socketBundle.answerQueue.push(next);
	if(socketBundle.answerQueue.length > 1){
		socketBundle.answerQueue.push(function(){
			socketBundle.socket.write(command)
		});
	}else{
		socketBundle.socket.write(command);
	}
}

function getPos(socketBundle){
	queueCommand(socketBundle, "GetPos?", ActPos);
};

function getDistances(socketBundle){
	queueCommand(socketBundle, "GetDistances?", ActDistances);
}

// Update data
function updateData(){
	clients.forEach(function(item){
		getPos(item);
		//getDistances(item);
	});
	console.log(clients);
};
