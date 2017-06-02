var dataApp = angular.module('dataApp', []);

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
