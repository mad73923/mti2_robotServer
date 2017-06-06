var port = 2323;

var net = require('net');

var exports = module.exports = {};

var clients = new Array();

// Server

var server = net.createServer(function(socket){
	connectionListener(socket);
});

exports.startServer = function(){
	console.log("Start Robot-Server at localhost:"+port);
	server.listen(port, '0.0.0.0', function(){
		console.log("Robot-Server started!");
	});
};

exports.stopServer = function(){
	console.log("Stopping Robot-Server!");
	server.close();
}

exports.getClientData = function(){
	var ret = new Array();
	clients.forEach(function(item){
		ret.push({
			uid: 	item.uid,
			data: 	item.data 
		});
	});
	return ret;
};

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
	socket.write("GetUID?");

	socket.on('data', (dataIn)=>{
		//console.log("RX data:"+dataIn);
		var knownSocket = clients.find(findSocket, socket);
		if(knownSocket==undefined){
			checkValidClient(dataIn, socket);
		}else{
			handleAnswer(dataIn, knownSocket);
		}
	});

	socket.on('close', ()=>{
		console.log("Connection to client closed.");
		deleteClientIfExists(socket);
	});
};

// Clients

function createNewClient(socket, uid){
	clients.push({
			socket: 		socket,
			commandQueue: 	[],
			answerQueue: 	[],
			uid: 			uid,
			data: 			{}
		});
}

function deleteClientIfExists(socket){
	var index = clients.findIndex(findSocket, socket);
	if(index != -1){
		console.log("Deleted client UID:"+clients[index].uid);
		clients.splice(index,1);
	}
}

// Answer handler

function handleAnswer(answer, socketBundle){
	var next = socketBundle.answerQueue.pop();
	if(next != undefined){
		next(answer, socketBundle);
	}else{
		unexpectedAnswer(answer, socketBundle);
	}
	nextCommand(socketBundle);
};

function checkValidClient(answer, socket){
	var validUID = /UID=[0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){11}/;
	var strAnswer = String(answer);
	if(strAnswer.match(validUID)!=null){
		console.log("Client valid! "+answer);
		createNewClient(socket, strAnswer.split("=")[1]);
	}else{
		console.log("Client not valid!");
		socket.end();
	}
};

function unexpectedAnswer(answer, socketBundle){
	console.log("Unexpected Answer from UID "+socketBundle.uid+" :"+answer);
};

function ActPos(answer, socketBundle){
	socketBundle.data.pos = String(answer);
};

function ActDistances(answer, socketBundle){
	socketBundle.data.distances = String(answer);
};

// Commands

function nextCommand(socketBundle){
	var next = socketBundle.commandQueue.pop();
	if(next != undefined){
		next(socketBundle);
	}
};

function findFunction(element, index, array){
	return element === this;
};

function queueCommand(socketBundle, command, next){
	if(socketBundle.answerQueue.findIndex(findFunction, next)==-1){
		socketBundle.answerQueue.unshift(next);
		if(socketBundle.answerQueue.length > 1){
			socketBundle.commandQueue.unshift(function(){
				socketBundle.socket.write(command)
			});
		}else{
			socketBundle.socket.write(command);
		}
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
		getDistances(item);
	});
	//console.log(clients);
};
