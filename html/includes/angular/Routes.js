var OCEM = angular.module('OnCallEscalationManager', ['ngRoute']);

OCEM.controller('indexCtlr', ['$scope','$http', indexCtrl]);
OCEM.controller('appCtlr', ['$scope','$http', '$routeParams', appCtrl]);


OCEM.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
        .when('/', {
            templateUrl: '/partials/Index.jade',
            controller: 'indexCtlr'
        })
        .when('/Applications/:appName', {
            templateUrl: '/partials/Index.jade',
            controller: 'appCtlr'
        })
        .otherwise({
            redirectTo: '/'
        });
  }]);


function indexCtrl($scope, $http) {
    $scope.colorCount = 5;
    $scope.method = 'GET';
    $scope.url = '/api/applications/';

    $http({method: $scope.method, url: $scope.url}).
        success(function(data, status) {
        $scope.status = status;
        $scope.apps = data.results;
    })
    .error(function(data, status) {
        $scope.apps = data.results || "Request failed";
        $scope.status = status;
    });
};

function appCtrl($scope, $http, $routeParams) {
    $scope.params = $routeParams;

    $scope.colorCount = 5;
    $scope.method = 'GET';
    $scope.url = '/api/applications/';

    $http({method: $scope.method, url: $scope.url}).
        success(function(data, status) {
        $scope.status = status;
        $scope.apps = data.results;
    })
    .error(function(data, status) {
        $scope.apps = data.results || "Request failed";
        $scope.status = status;
    });
};