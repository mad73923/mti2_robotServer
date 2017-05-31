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
	if(dataIn=="getUID"){
		connection.write("11:22:33:44");
	}
});
