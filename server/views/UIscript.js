var dataApp = angular.module('dataApp', ['chart.js']);

dataApp.controller('dataCtrl', function($scope, $http){
	// Control
	// up, left, down, right
	let keyPressed = [0,0,0,0];
	let keyPressedOld = [0,0,0,0];
	let fullThrottle = 1000;
	
	$scope.currentItemIndex = -1;
	$scope.data = {};
	$scope.data.clients = [];
	$scope.manualThrottle = fullThrottle;
	updateClients();

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
		let oldLength = $scope.data.clients.length;
		$scope.data = data;
		if(oldLength != $scope.data.clients.length){
			$scope.currentItemIndex = -1;
		}
	};

	$scope.stringifyLog = function(log){
		if(log == undefined)
			return;
		var str = "";
		log.forEach(function(item){
			str += item[0]+" "+item[1]+"\n\r";
		});
		return str;
	}

	$scope.setThrottle = function(throttle){
		if(throttle[0]!=undefined && throttle[1]!=undefined){
			socket.emit('robotCommand', "setThrottle", $scope.currentItemIndex, throttle);
		}
	};

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
					throttle = [$scope.manualThrottle,$scope.manualThrottle];
				}else if(keyPressed[1]){
					throttle = [-$scope.manualThrottle,$scope.manualThrottle];
				}else if(keyPressed[2]){
					throttle = [-$scope.manualThrottle,-$scope.manualThrottle];
				}else if(keyPressed[3]){
					throttle = [$scope.manualThrottle,-$scope.manualThrottle];
				}
			}else{
				if(keyPressed[0] && keyPressed[1]){
					throttle = [0,$scope.manualThrottle];
				}else if(keyPressed[1] && keyPressed[2]){
					throttle = [0,-$scope.manualThrottle];
				}else if(keyPressed[2] && keyPressed[3]){
					throttle = [-$scope.manualThrottle,0];
				}else if(keyPressed[0] && keyPressed[3]){
					throttle = [$scope.manualThrottle,0];
				}else{
					throttle = [0,0];
				}
			}
			if($scope.currentItemIndex > -1){
				$scope.setThrottle(throttle);
			}
		}
		keyPressedOld = keyPressed.slice(0);
	};
});
