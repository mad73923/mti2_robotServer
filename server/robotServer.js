var port = 2323;

var net = require('net');
var moment = require('moment');

const EventEmitter = require('events');
const util = require('util');

function RobotServerEmitter(){
	EventEmitter.call(this);
}

util.inherits(RobotServerEmitter, EventEmitter);

var exports = module.exports = {};

var clients = new Array();
var serverLogHistory = {};

// Server

var server = net.createServer(function(socket){
	connectionListener(socket);
});

exports.startServer = function(){
	serverLog("info", "Start Robot-Server at localhost:"+port);
	server.listen(port, '0.0.0.0', function(){
		serverLog("info", "Robot-Server started!");
	});
};

exports.stopServer = function(){
	serverLog("info", "Stopping Robot-Server!")
	server.close();
}

exports.getClientData = function(){
	var ret = {};
	ret.clients = new Array();
	clients.forEach(function(item){
		ret.clients.push({
			uid: 	item.uid,
			data: 	item.data,
			log: 	item.log 
		});
	});
	ret.serverLog = serverLogHistory;
	return ret;
};

exports.emitter = new RobotServerEmitter();

exports.emitter.on('newCommand',(command, index, values)=>{
		UICommandHandler(command, index, values);
	});

// level: error, warn, info, debug
function serverLog(level, message){
	if(serverLogHistory[level] == undefined){
		serverLogHistory[level] = [];
	}
	var timeString = moment().format('HH:mm:ss.SSS');
	serverLogHistory[level].push([timeString, message]);
	limitArray(serverLogHistory[level]);
	if(level =="info" || level == "error"){
		console.log(timeString, message);
	}
	exports.emitter.emit('newData');
};

function clientLog(socketBundle, level, message){
	if(socketBundle.log[level] == undefined){
		socketBundle.log[level] = [];
	}
	var timeString = moment().format('HH:mm:ss.SSS');
	socketBundle.log[level].push([timeString, message]);
	limitArray(socketBundle.log[level]);
	exports.emitter.emit('newData');
}

function limitArray(array){
	if(array.length > 500){
		array.shift();
	}
}

// Intervall function

var timer = setInterval(()=>{
	updateData();
}, 500);

// Socket handler

function findSocket(element, index, array){
	return element.socket === this;
};

function connectionListener(socket){
	serverLog("info", "New client connected, checking validity...");
	socket.write("GetUID?\n");

	socket.on('data', (dataIn)=>{
		serverLog("debug", "RX data: "+dataIn);
		var knownSocket = clients.find(findSocket, socket);
		if(knownSocket==undefined){
			checkValidClient(dataIn, socket);
		}else{
			clientLog(knownSocket, "debug", "RX data: "+dataIn);
			handleAnswer(dataIn, knownSocket);
		}
	});

	socket.on('close', ()=>{
		serverLog("info", "Connection to client closed.");
		deleteClientIfExists(socket);
	});

	socket.on('error', ()=>{
		serverLog("error", "Connection error.");
		deleteClientIfExists(socket);
	});
};

// Clients

function findUID(element, index, array){
	return element.uid == this;
}

function createNewClient(socket, uid){
	var index = clients.push({
			socket: 		socket,
			commandQueue: 	[],
			answerQueue: 	[],
			uid: 			uid,
			data: 			{
				radar: 			{
					labels: 		[]
				}
			},
			log: 			{}
		});
	clientLog(clients[index-1], "info", "Client created.");
}

function deleteClientIfExists(socket){
	var index = clients.findIndex(findSocket, socket);
	if(index != -1){
		serverLog("info", "Deleted client UID:"+clients[index].uid);
		clients.splice(index,1);
		exports.emitter.emit('newData');
	}
}

function deleteIfUIDAlreadyExists(uid){
	var index = clients.findIndex(findUID, uid);
	if(index != -1){
		serverLog("info", "Delete old client with same UID");
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
		serverLog("info", "Client valid! "+answer);
		var strUID = strAnswer.split("=")[1];
		deleteIfUIDAlreadyExists(strUID);
		createNewClient(socket, strUID);
		exports.emitter.emit('newData');
	}else{
		serverLog("error", "Client not valid!");
		socket.end();
	}
};

function unexpectedAnswer(answer, socketBundle){
	serverLog("error", "Unexpected Message from UID "+socketBundle.uid+" :"+answer);
	clientLog(socketBundle, "error", "Unexpected Message: "+answer)
};

function wrongFormat(socketBundle, answer, format){
	serverLog("error", "Wrong format UID "+socketBundle.uid+"\nexpected\n"+format+"\nreceived\n"+answer);
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
	command = command +"\n";
	socketBundle.answerQueue.unshift(next);
	if(socketBundle.answerQueue.length > 1){
		socketBundle.commandQueue.unshift(function(){
			clientLog(socketBundle, "debug", "TX data: "+command);
			socketBundle.socket.write(command)
		});
	}else{
		clientLog(socketBundle, "debug", "TX data: "+command);
		socketBundle.socket.write(command);
	}
}

// Update data
function updateData(){
	clients.forEach(function(item){
		getPos(item);
		getDistances(item);
	});
};

// ================== Robot functions ==================================
// ====================== GETTER =======================================


function getPos(socketBundle){
	queueGetter(socketBundle, "GetPos?", answActPos);
};

function answActPos(answer, socketBundle){
	var strAnswer = String(answer);
	var validAnswer = /ActPos=\[([+-]?\d*\.?\d*,){2}[+-]?\d*\.?\d*\]/
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

function setThrottle(socketBundle, value){
	queueSetter(socketBundle, "SetThrottle!"+JSON.stringify(value), answSetThrottle);
}

function answSetThrottle(answer, socketBundle){
	var strAnswer = String(answer);
	var validAnswer = /SetThrottle=\[-?\d+,-?\d+\]/
	if(strAnswer.match(validAnswer)!=null){
		strAnswer = strAnswer.split("=")[1];
		socketBundle.data.motor = JSON.parse(strAnswer);
		exports.emitter.emit('newData');
	}else{
		wrongFormat(socketBundle, answer, validAnswer);
	}
}

function setPosition(socketBundle, value){
	queueSetter(socketBundle, "SetPosition!"+JSON.stringify(value), answSetPosition);
}

function answSetPosition(answer, socketBundle){

}

function setHorn(socketBundle, value){
	queueSetter(socketBundle, "SetHorn!"+JSON.stringify([value]), answSetHorn);
}

function answSetHorn(answer, socketBundle){

}

// HANDLER

function UICommandHandler(command, index, values){
	if(String(command) == "setThrottle"){
		setThrottle(clients[index], values);
	}else if(String(command) == "setPosition"){
		setPosition(clients[index], values);
	}else if(String(command) == "setHorn"){
		setHorn(clients[index], values);
	}
}
