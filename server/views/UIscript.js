var dataApp = angular.module('dataApp', ['chart.js']);

dataApp.controller('dataCtrl', function($scope, $http){
	updateClients();
	$scope.currentItemIndex = -1;

	// socket.io

	var socket = io();

	socket.on('message', function(data){
		$scope.clients = data;
		$scope.$apply();
	});

	$scope.radarOptions = {
	    scale: {
			ticks:{beginAtZero:true}
	    }
	};

	$scope.setTempItemIndex = function(index){
		$scope.currentItemIndex = index;
	};

	function updateClients(){
		$http.get('/clients.json').then(function(data){
			$scope.clients = data.data;
		});
	};
});
