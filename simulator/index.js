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

// Robot parameters

var maxThrottle = 2000;
var throttle = [0,0];
var position = [0,0];

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
	setTimeout(handleCommand, Math.random()*100, dataIn);
});

function handleCommand(dataIn){
	var dataInStr = String(dataIn);
	dataInStr = dataInStr.split('\n')[0];
	console.log(dataInStr);
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
	if(dataInStr.match(/SetThrottle!\[-?\d+,-?\d+\]/)!=null){
		values = JSON.parse(dataInStr.split("!")[1]);
		values[0] = plusMinusMax(values[0], maxThrottle);
		values[1] = plusMinusMax(values[1], maxThrottle);
		throttle = values;
		connection.write("SetThrottle="+JSON.stringify(values));
	}
};

function plusMinusMax(value, maxAbsValue){
	if(value > maxAbsValue){
		return maxAbsValue;
	}else if(value < -maxAbsValue){
		return -maxAbsValue;
	}else{
		return value;
	}
}
