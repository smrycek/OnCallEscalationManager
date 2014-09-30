var OCEM = angular.module('OnCallEscalationManager', []);

OCEM.controller('index', ['$scope','$http', indexCtrl]);

function indexCtrl($scope, $http) { 
    $scope.method = 'GET';
    $scope.url = '/api/applications/';
    $http({method: $scope.method, url: $scope.url}).
        success(function(data, status) {
          $scope.status = status;
          $scope.apps = data.results;
        }).
        error(function(data, status) {
          $scope.apps = data.results || "Request failed";
          $scope.status = status;
      });
    };