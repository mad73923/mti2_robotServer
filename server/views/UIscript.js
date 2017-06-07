var dataApp = angular.module('dataApp', ['chart.js']);

dataApp.controller('dataCtrl', function($scope, $http){
	setInterval(()=>{
		updateClients($scope, $http);
	}, 500);
});

function updateClients($scope, $http){
	$http.get('/clients.json').then(function(data){
		$scope.clients = data.data;
	});
};

dataApp.controller('radarCtrl', function($scope){
	$scope.chart = {};
	$scope.chart.labels = [];
	$scope.chart.data = [];
	for(i=1; i<=36; i++){
		$scope.chart.labels.push(String((i-1)*10)+"°");
		$scope.chart.data.push(Math.random()*20);
	}
});
