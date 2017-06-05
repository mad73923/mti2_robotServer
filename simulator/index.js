var port = 2323;

var net = require('net');

console.log("Start Robot-Simulator. Connect to localhost:"+port);

var connection = net.createConnection({port: port});

connection.on('error', (er)=>{
	console.log("Couldn't establish connection to Server.\nDid you start the server?\n"+er);
});

connection.on('connect', ()=>{
	console.log("Connection to Server established.");
});

connection.on('end', ()=>{
	console.log("Connection lost, bye!");
});

connection.on('data', (dataIn) =>{
	setTimeout(handleCommand, Math.random()*500, dataIn);
});

function handleCommand(dataIn){
	if(dataIn=="getUID"){
		connection.write("11:22:33:44:55:66:77:88:99:AA:BB:CC");
	}
	if(dataIn=="GetPos?"){
		connection.write("ActPos=[3202,1704,68]")
	}
	if(dataIn=="GetDistances?"){
		connection.write("ActDistances=[150,342,242,324,213,4,2,35,23]")
	}
};
