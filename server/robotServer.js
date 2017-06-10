var port = 2323;

var net = require('net');

const EventEmitter = require('events');
const util = require('util');

function RobotServerEmitter(){
	EventEmitter.call(this);
}

util.inherits(RobotServerEmitter, EventEmitter);

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

exports.emitter = new RobotServerEmitter();

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

	socket.on('error', ()=>{
		console.log("Connection error.");
		deleteClientIfExists(socket);
	});
};

// Clients

function findUID(element, index, array){
	return element.uid == this;
}

function createNewClient(socket, uid){
	clients.push({
			socket: 		socket,
			commandQueue: 	[],
			answerQueue: 	[],
			uid: 			uid,
			data: 			{
				radar: 			{
					labels: 		[]
				}
			}
		});
}

function deleteClientIfExists(socket){
	var index = clients.findIndex(findSocket, socket);
	if(index != -1){
		console.log("Deleted client UID:"+clients[index].uid);
		clients.splice(index,1);
		exports.emitter.emit('newData');
	}
}

function deleteIfUIDAlreadyExists(uid){
	var index = clients.findIndex(findUID, uid);
	if(index != -1){
		console.log("Delete old client with same UID");
		clients[index].socket.destroy();
		clients.splice(index,1);
		exports.emitter.emit('newData');
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
		var strUID = strAnswer.split("=")[1];
		deleteIfUIDAlreadyExists(strUID);
		createNewClient(socket, strUID);
		exports.emitter.emit('newData');
	}else{
		console.log("Client not valid!");
		socket.end();
	}
};

function unexpectedAnswer(answer, socketBundle){
	console.log("Unexpected Message from UID "+socketBundle.uid+" :"+answer);
};

function wrongFormat(socketBundle, answer, format){
	console.log("Wrong format UID "+socketBundle.uid+"\nexpected\n"+format+"\nreceived\n"+answer);
}

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

function queueGetter(socketBundle, command, next){
	if(socketBundle.answerQueue.findIndex(findFunction, next)==-1){
		queueSetter(socketBundle, command, next);
	}
}

function queueSetter(socketBundle, command, next){
	socketBundle.answerQueue.unshift(next);
	if(socketBundle.answerQueue.length > 1){
		socketBundle.commandQueue.unshift(function(){
			socketBundle.socket.write(command)
		});
	}else{
		socketBundle.socket.write(command);
	}
}

// Update data
function updateData(){
	clients.forEach(function(item){
		getPos(item);
		getDistances(item);
		//driveTurn(item, -90);
		//driveStraight(item, 120);
	});
	//console.log(clients);
};

// ================== Robot functions ==================================
// ====================== GETTER =======================================


function getPos(socketBundle){
	queueGetter(socketBundle, "GetPos?", answActPos);
};

function answActPos(answer, socketBundle){
	var strAnswer = String(answer);
	var validAnswer = /ActPos=\[(\d+,){2}[+-]?\d*\.?\d*\]/
	if(strAnswer.match(validAnswer)!=null){
		strAnswer = strAnswer.split("=")[1];
		socketBundle.data.pos = JSON.parse(strAnswer);
		exports.emitter.emit('newData');
	}else{
		wrongFormat(socketBundle, answer, validAnswer);
	}
};

function getDistances(socketBundle){
	queueGetter(socketBundle, "GetDistances?", answActDistances);
};

function answActDistances(answer, socketBundle){
	var strAnswer = String(answer);
	var validAnswer = /ActDistances=\[\d+(,\d+)*\]/
	if(strAnswer.match(validAnswer)!=null){
		strAnswer = strAnswer.split("=")[1];
		socketBundle.data.radar.distances = JSON.parse(strAnswer);
		socketBundle.data.radar.distances.reverse();
		socketBundle.data.radar.distances.unshift(socketBundle.data.radar.distances.pop());
		if(socketBundle.data.radar.distances.length != socketBundle.data.radar.labels.length){
			socketBundle.data.radar.labels = [];
			labels = socketBundle.data.radar.labels;
			var len = socketBundle.data.radar.distances.length;
			var step = 360/len;
			for(i=1; i<=len; i++){
				labels.unshift(String((i-1)*step)+"°");
			}
			labels.unshift(labels.pop());
		}
		exports.emitter.emit('newData');
	}else{
		wrongFormat(socketBundle, answer, validAnswer);
	}
};

// ====================== SETTER =======================================

function driveTurn(socketBundle, value){
	queueSetter(socketBundle, "DriveTurn!"+String(value), answDriveTurn);
};

function answDriveTurn(answer, socketBundle){

};

function driveStraight(socketBundle, value){
	queueSetter(socketBundle, "DriveStraight!"+String(value), answDriveStraight);
};

function answDriveStraight(answer, socketBundle){

};
