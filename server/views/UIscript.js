var dataApp = angular.module('dataApp', ['chart.js']);

dataApp.controller('dataCtrl', function($scope, $http){
	updateClients($scope, $http);
	setInterval(()=>{
		updateClients($scope, $http);
	}, 500);

	$scope.currentItemIndex = -1;

	setInterval(()=>{
		randomRadar($scope);
	}, 500);

	$scope.setTempItemIndex = function(index){
		$scope.currentItemIndex = index;
	};
});

function updateClients($scope, $http){
	$http.get('/clients.json').then(function(data){
		$scope.clients = data.data;
	});
};
