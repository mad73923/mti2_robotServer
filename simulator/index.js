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

var timer = setInterval(()=>{
	updatePosition();
}, 10);

// Robot parameters

var maxThrottle = 2000;
var throttle = [0,0];
var position = [0,0,Math.PI/2];

connection.on('error', (er)=>{
	console.log("Couldn't establish connection to Server.\nDid you start the server?\n"+er);
	process.exit();
});

connection.on('connect', ()=>{
	console.log("Connection to Server established.");
});

connection.on('end', ()=>{
	console.log("Connection lost, bye!");
	process.exit();
});

connection.on('data', (dataIn) =>{
	setTimeout(handleCommand, Math.random()*100, dataIn);
});

function handleCommand(dataIn){
	var dataInStr = String(dataIn);
	dataInStr = dataInStr.split('\n')[0];
	//console.log(dataInStr);
	if(dataInStr=="GetUID?"){
		connection.write("UID="+uidStr);
	}
	if(dataInStr=="GetPos?"){
		var posPrec = [0,0,0];
		var precision = 100000000;
		posPrec[0] = Math.round(position[0]*precision)/precision;
		posPrec[1] = Math.round(position[1]*precision)/precision;
		posPrec[2] = Math.round(position[2]*precision)/precision;
		var answ = "ActPos="+JSON.stringify(posPrec);
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
	if(dataInStr.match(/SetPosition!\[([+-]?\d*\.?\d*,){2}[+-]?\d*\.?\d*\]/)){
		values = JSON.parse(dataInStr.split("!")[1]);
		position = values;
		connection.write("SetPosition=OK");
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

function updatePosition(){
	var halfAxialLength = 70;
	var dividerS = 20000;

	// left wheel
	var deltaS = -throttle[0]/dividerS;
	var alpha_rad = deltaS/(halfAxialLength*2);
	var deltaX = -(halfAxialLength - (Math.cos(alpha_rad)*halfAxialLength));
	var deltaY = Math.sin(alpha_rad)*halfAxialLength;
	var cSlash = Math.tan(alpha_rad)*halfAxialLength;
	var deltaTheta_rad = -(Math.atan2(halfAxialLength, cSlash));
	if(alpha_rad >= Math.PI || alpha_rad <= -Math.PI){
		deltaTheta_rad += Math.PI;
	}
	var deltaXLeft_global = -Math.sin(position[2])*deltaX+Math.cos(position[2])*deltaY;
	var deltaYLeft_global = Math.cos(position[2])*deltaX-Math.sin(position[2])*deltaY;

	// right wheel
	deltaS = -throttle[1]/dividerS;
	alpha_rad = deltaS/(halfAxialLength*2);
	deltaX = halfAxialLength - (Math.cos(alpha_rad)*halfAxialLength);
	deltaY = Math.sin(alpha_rad)*halfAxialLength;
	cSlash = Math.tan(alpha_rad)*halfAxialLength;
	deltaTheta_rad += Math.atan2(halfAxialLength, cSlash);
	if(alpha_rad >= Math.PI || alpha_rad <= -Math.PI){
		deltaTheta_rad += Math.PI;
	}
	var deltaXRight_global = -Math.sin(position[2])*deltaX+Math.cos(position[2])*deltaY;
	var deltaYRight_global = Math.cos(position[2])*deltaX-Math.sin(position[2])*deltaY;

	position[0] -= deltaXLeft_global+deltaXRight_global;
	position[1] += deltaYLeft_global+deltaYRight_global;
	position[2] += deltaTheta_rad;
	if(position[2]< -Math.PI){
		position[2] += 2* Math.PI;
	}else if(position[2]>Math.PI){
		position[2] -= 2* Math.PI;
	}
}
