var dataApp = angular.module('dataApp', ['chart.js']);

dataApp.controller('dataCtrl', function($scope, $http){
	updateClients($scope, $http);
	setInterval(()=>{
		updateClients($scope, $http);
	}, 500);

	$scope.currentItemIndex = -1;

	$scope.chart = {};
	$scope.chart.labels = [];
	$scope.chart.data = [];
	for(i=1; i<=36; i++){
		$scope.chart.labels.push(String((i-1)*10)+"°");
		$scope.chart.data.push(Math.random()*20);
	}
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

function randomRadar($scope){
	for(i=1; i<=36; i++){
		$scope.chart.data[i-1] = Math.random()*20;
	}
}
