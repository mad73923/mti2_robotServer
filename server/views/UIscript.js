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
		if(keyPressed[0] != keyPressedOld[0] || keyPressed[1] != keyPressedOld[1] || keyPressed[2] != keyPressedOld[2] || keyPressed[3] != keyPressedOld[3]){
			socket.emit('robotCommand', $scope.currentItemIndex);
			let arraySum = keyPressed.reduce(function (a, b) {
				return a + b;
				}, 0);
			if(arraySum == 0 || arraySum > 2){
				console.log("[0,0]");
			}else if(arraySum ==1){
				if(keyPressed[0]){
					console.log("[1500,1500]");
				}else if(keyPressed[1]){
					console.log("[0,1500]");
				}else if(keyPressed[2]){
					console.log("[-1500,-1500]");
				}else if(keyPressed[3]){
					console.log("[1500,0]");
				}
			}else{
				if(keyPressed[0] && keyPressed[1]){
					console.log("[750,1500]");
				}else if(keyPressed[1] && keyPressed[2]){
					console.log("[-750,-1500]");
				}else if(keyPressed[2] && keyPressed[3]){
					console.log("[-1500,-750]");
				}else if(keyPressed[0] && keyPressed[3]){
					console.log("[1500,750]");
				}else{
					console.log("[0,0]");
				}
			}
		}
		keyPressedOld = keyPressed.slice(0);
	};
});
