var dataApp = angular.module('dataApp', ['chart.js']);

dataApp.controller('dataCtrl', function($scope, $http){
	// Control
	// up, left, down, right
	let keyPressed = [0,0,0,0];
	let keyPressedOld = [0,0,0,0];
	let fullThrottle = 1000;

	$scope.PIDmanualSpeed = 1200;
	$scope.PID_kP = 30;
	$scope.PID_kI = 20;
	$scope.PID_kD = 8;
	
	$scope.currentItemIndex = -1;
	$scope.clients = [];
	$scope.manualThrottle = fullThrottle;
	updateClients();

	// 0 = manual, 1 = PID
	$scope.motorMode = 1;

	$scope.Math = window.Math;

	// socket.io

	var socket = io();

	socket.on('message', function(data){
		newData(data);
		$scope.$apply();
	});

	$scope.radarOptions = {
	    scale: {
			ticks:{
				beginAtZero:true
			}
	    }
	};

	$scope.setTempItemIndex = function(index){
		$scope.currentItemIndex = index;
	};

	$scope.resetPosition = function(){
		if($scope.currentItemIndex > -1){
			socket.emit('robotCommand', "setPosition", $scope.currentItemIndex, [0,0,Math.PI/2]);
		}
	}

	function updateClients(){
		$http.get('/clients.json').then(function(data){
			newData(data.data);
		});
	};

	function newData(data){
		let oldLength = $scope.clients.length;
		$scope.clients = data;
		if(oldLength != $scope.clients.length){
			$scope.currentItemIndex = -1;
		}
	};

	$scope.setThrottle = function(throttle){
		if($scope.manualThrottle != undefined){
			socket.emit('robotCommand', "setThrottle", $scope.currentItemIndex, throttle);
		}
	};

	$scope.setSpeed = function(speed){
		if($scope.PIDmanualSpeed != undefined){
			socket.emit('robotCommand', "setSpeed", $scope.currentItemIndex, speed);
		}
	}

	$scope.robotMove = function(values){
		if($scope.motorMode==0 || (values[0]==0 && values[1]==0)){
			values[0]*=$scope.manualThrottle;
			values[1]*=$scope.manualThrottle;
			$scope.setThrottle(values);
		}else if($scope.motorMode == 1){
			values[0]*=$scope.PIDmanualSpeed;
			values[1]*=$scope.PIDmanualSpeed;
			$scope.setSpeed(values);
		}
	}

	$scope.PID_setParameters = function(){
		if($scope.PID_kP != undefined && $scope.PID_kI != undefined && $scope.PID_kD != undefined){
			socket.emit('robotCommand', "setPID", $scope.currentItemIndex, [$scope.PID_kP, $scope.PID_kI, $scope.PID_kD]);
		}
	};

	$scope.setMotorMode = function(mode){
		$scope.motorMode = mode;
	}

	$scope.setHorn = function(enable){
		socket.emit('robotCommand', "setHorn", $scope.currentItemIndex, enable);
	}

	$scope.keyDown = function(event){
		if(event.key == "ArrowUp"){
			keyPressed[0] = 1;
		}else if(event.key == "ArrowLeft"){
			keyPressed[1] = 1;
		}else if(event.key == "ArrowDown"){
			keyPressed[2] = 1;
		}else if(event.key == "ArrowRight"){
			keyPressed[3] = 1;
		}else if(event.key == "H" || event.key == "h"){
			$scope.setHorn(1);
		}
		checkKeysForChanges();
	};

	$scope.keyUp = function(event){
		if(event.key == "ArrowUp"){
			keyPressed[0] = 0;
		}else if(event.key == "ArrowLeft"){
			keyPressed[1] = 0;
		}else if(event.key == "ArrowDown"){
			keyPressed[2] = 0;
		}else if(event.key == "ArrowRight"){
			keyPressed[3] = 0;
		}else if(event.key == "H" || event.key == "h"){
			$scope.setHorn(0);
		}
		checkKeysForChanges();
	};

	function checkKeysForChanges(){
		let throttle = [0,0];
		if(keyPressed[0] != keyPressedOld[0] || keyPressed[1] != keyPressedOld[1] || keyPressed[2] != keyPressedOld[2] || keyPressed[3] != keyPressedOld[3]){
			let arraySum = keyPressed.reduce(function (a, b) {
				return a + b;
				}, 0);
			if(arraySum == 0 || arraySum > 2){
				throttle = [0,0];
			}else if(arraySum ==1){
				if(keyPressed[0]){
					throttle = [1,1];
				}else if(keyPressed[1]){
					throttle = [-1,1];
				}else if(keyPressed[2]){
					throttle = [-1,-1];
				}else if(keyPressed[3]){
					throttle = [1,-1];
				}
			}else{
				if(keyPressed[0] && keyPressed[1]){
					throttle = [0,1];
				}else if(keyPressed[1] && keyPressed[2]){
					throttle = [0,-1];
				}else if(keyPressed[2] && keyPressed[3]){
					throttle = [-1,0];
				}else if(keyPressed[0] && keyPressed[3]){
					throttle = [1,0];
				}else{
					throttle = [0,0];
				}
			}
			if($scope.currentItemIndex > -1){
				if($scope.motorMode==0){
					$scope.setThrottle([throttle[0]*$scope.manualThrottle, throttle[1]*$scope.manualThrottle]);
				}else if($scope.motorMode==1){
					$scope.setSpeed([throttle[0]*$scope.PIDmanualSpeed, throttle[1]*$scope.PIDmanualSpeed]);
				}
			}
		}
		keyPressedOld = keyPressed.slice(0);
	};
});
