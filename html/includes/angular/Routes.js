var OCEM = angular.module('OnCallEscalationManager', ['ngRoute', 'ui.bootstrap', 'ui.mask']);

OCEM.controller('indexCtlr', ['$scope','$http', indexCtrl]);
OCEM.controller('detailCtlr', ['$scope','$http', '$routeParams', detailCtrl]);
OCEM.controller('newAppCtrl', ['$scope','$http', '$route', newAppCtrl]);
OCEM.controller('newStaffCtrl', ['$scope', '$http', '$route', '$routeParams', newStaffCtrl]);
OCEM.controller('removeAppCtrl', ['$scope', '$http', '$modal', '$routeParams', '$location', removeAppCtrl]);
OCEM.controller('removeModalCtrl', ['$scope', '$modalInstance', removeModalCtrl]);


OCEM.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
        .when('/', {
            templateUrl: '/partials/Index.jade',
            controller: 'indexCtlr'
        })
        .when('/Applications/:appName', {
            templateUrl: '/partials/detail.jade',
            controller: 'detailCtlr'
        })
        .otherwise({
            redirectTo: '/'
        });
  }]);


function indexCtrl($scope, $http) {
    $scope.colorCount = 5;
    $scope.method = 'GET';
    $scope.url = '/api/applications/';

    $scope.isCollapsed = true;
    $scope.count = 0;

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

function detailCtrl($scope, $http, $routeParams) {
    $scope.method = 'GET';
    $scope.url = '/api/applications/' + $routeParams.appName;
    $scope.appName = $routeParams.appName;
    $scope.isCollapsed = true;

    $http({method: $scope.method, url: $scope.url}).
        success(function(data, status) {
        $scope.status = status;
        $scope.app = data.results;
    })
    .error(function(data, status) {
        $scope.app = data.results || "Request failed";
        $scope.status = status;
    });
};

function newAppCtrl($scope, $http, $route) { 
    $scope.form = {};
    $scope.form.appName = "";
    $scope.form.appPhone = "";

    $scope.form.submit = function (item, event) {
        var dataObject = {
            Name: $scope.form.appName,
            Phone: $scope.form.appPhone
        };

        var responsePromise = $http.post("/api/applications/", dataObject, {});
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data.Message);
        });
    };

    $scope.form.empty = function () {
        $scope.form.appName = "";
        $scope.form.appPhone = "";
    };
};

function newStaffCtrl($scope, $http, $route, $routeParams){
    $scope.form = {};
    $scope.staffName ="";
    $scope.staffPrimary ="";

    $scope.form.submit = function (item, event) {
        var dataObject = {
            Name: $scope.form.staffName,
            Phone: $scope.form.staffPrimary
        };
        var responsePromise = $http.post("/api/applications/" + $routeParams.appName + "/staff", dataObject, {});
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data.Message);
        });
    };
};

function removeAppCtrl($scope, $http, $modal, $routeParams, $location) {
    $scope.open = function (size) {

        var modalInstance = $modal.open({
            templateUrl: 'removeAppModal.jade',
            controller: 'removeModalCtrl',
            size: size
        });

        modalInstance.result.then(function () {
            var responsePromise = $http.delete("/api/applications/" + $routeParams.appName, {});
            responsePromise.success(function (data, status) {
                $location.path("/");
            });
            responsePromise.error(function (data, status) {
                alert(data.Message);
            });
        });
    }
};

function removeModalCtrl($scope, $modalInstance){
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};