var dataApp = angular.module('dataApp', ['chart.js']);

dataApp.controller('dataCtrl', function($scope, $http){
	$scope.currentItemIndex = -1;
	$scope.clients = [];
	updateClients();

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


	// Control
	// up, left, down, right
	let keyPressed = [0,0,0,0];
	let keyPressedOld = [0,0,0,0];
	let fullThrottle = 1500;

	$scope.keyDown = function(event){
		if(event.key == "ArrowUp"){
			keyPressed[0] = 1;
		}else if(event.key == "ArrowLeft"){
			keyPressed[1] = 1;
		}else if(event.key == "ArrowDown"){
			keyPressed[2] = 1;
		}else if(event.key == "ArrowRight"){
			keyPressed[3] = 1;
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
					throttle = [fullThrottle,fullThrottle];
				}else if(keyPressed[1]){
					throttle = [0,fullThrottle];
				}else if(keyPressed[2]){
					throttle = [-fullThrottle,-fullThrottle];
				}else if(keyPressed[3]){
					throttle = [fullThrottle,0];
				}
			}else{
				if(keyPressed[0] && keyPressed[1]){
					throttle = [Math.round(fullThrottle/2),fullThrottle];
				}else if(keyPressed[1] && keyPressed[2]){
					throttle = [-Math.round(fullThrottle/2),-fullThrottle];
				}else if(keyPressed[2] && keyPressed[3]){
					throttle = [-fullThrottle,-Math.round(fullThrottle/2)];
				}else if(keyPressed[0] && keyPressed[3]){
					throttle = [fullThrottle,Math.round(fullThrottle/2)];
				}else{
					throttle = [0,0];
				}
			}
			if($scope.currentItemIndex > -1){
			socket.emit('robotSetThrottle', $scope.currentItemIndex, throttle);
			}
		}
		keyPressedOld = keyPressed.slice(0);
	};
});
