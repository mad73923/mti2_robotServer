var port = 2323;

var net = require('net');

console.log("Start Robot-Simulator. Connect to localhost:"+port);

var connection = net.createConnection({port: port});

var uidStr = generateRandomUID();

function generateRandomUID(){
	var temp = new Buffer(1);
	uidStr = "";
	for(i=0; i<12; i++){
		temp[0]=Math.round(Math.random()*255);
		uidStr = uidStr + temp.toString('hex') + ":";
	}
	return uidStr.slice(0,-1);
}

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
	var dataInStr = String(dataIn);
	dataInStr = dataInStr.split('\n')[0];
	if(dataInStr=="GetUID?"){
		connection.write("UID="+uidStr);
	}
	if(dataInStr=="GetPos?"){
		var answ = "ActPos=[";
		for(i=0; i<2; i++){
			answ += String(Math.round(Math.random()*20))+",";
		}
		answ += String(Math.random()*360)+"]";
		connection.write(answ);
	}
	if(dataInStr=="GetDistances?"){
		var ret = [];
		for(i=0; i<36; i++){
			ret.push(Math.round(Math.random()*20)+20);
		}
		connection.write("ActDistances=["+ret+"]");
	}
	if(dataInStr.match(/DriveTurn![-]?\d+/)!=null){
		connection.write("DriveTurn=OK");
	}
	if(dataInStr.match(/DriveStraight![-]?\d+/)!=null){
		connection.write("DriveStraight=OK");
	}
};
