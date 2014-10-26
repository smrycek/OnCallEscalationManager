var OCEM = angular.module('OnCallEscalationManager', ['ngRoute', 'ui.bootstrap', 'ui.mask']);

OCEM.controller('indexCtlr', ['$scope','$http', indexCtrl]);
OCEM.controller('detailCtlr', ['$scope','$http', '$routeParams', detailCtrl]);
OCEM.controller('newAppCtrl', ['$scope','$http', '$route', newAppCtrl]);
OCEM.controller('newStaffCtrl', ['$scope', '$http', '$route', '$routeParams', newStaffCtrl]);
OCEM.controller('removeAppCtrl', ['$scope', '$http', '$modal', '$routeParams', '$location', removeAppCtrl]);
OCEM.controller('removeModalCtrl', ['$scope', '$modalInstance', removeModalCtrl]);
OCEM.controller('editAppCtrl', ['$scope', '$http', '$route', '$routeParams', editAppCtrl]);
OCEM.controller('editStaffCtrl', ['$scope', '$http', '$route', '$routeParams', editStaffCtrl]);
OCEM.controller('removeStaffCtrl', ['$scope', '$http', '$route', '$routeParams', removeStaffCtrl]);
OCEM.controller('segmentCtrl', ['$scope', '$http', '$modal', '$route', '$routeParams', '$location', segmentCtrl]);


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
}

function detailCtrl($scope, $http, $routeParams) {
    $scope.method = 'GET';
    $scope.url = '/api/applications/' + $routeParams.appName;
    $scope.appName = $routeParams.appName;
    $scope.isCollapsed = true;
    $scope.isEditingApp = false;
    var date = moment();
    $scope.date = date;
    var appl;
    var segments = [];
    var emptySegment = new Object();

    $http({method: $scope.method, url: $scope.url}).
        success(function(data, status) {
        $scope.status = status;
        $scope.app = data.results;
        appl = data.results;

        if (appl.Segments) {
            appl.Segments.sort(function(a,b){
                  return moment(a.StartDate).utc() - moment(b.StartDate).utc();
            });
        }

        // Check if the first segment is current
        if(!appl.Segments || appl.Segments.length == 0 || moment(appl.Segments[0].StartDate).isAfter(date)){
            emptySegment.StartDate = moment().utc();
            emptySegment.StartDate.hour(0);
            if(appl.Segments && appl.Segments.length > 0){
                emptySegment.EndDate = moment(appl.Segments[0].StartDate).utc();
                emptySegment.EndDate.subtract(1, 'd');
                emptySegment.EndDate.hour(0);

                //Turn the dates in to moment objects
                appl.Segments[0].StartDate = moment(appl.Segments[0].StartDate).utc();
                appl.Segments[0].EndDate = moment(appl.Segments[0].EndDate).utc();
                //Set hours back to 0
                appl.Segments[0].StartDate.hours(0);
                appl.Segments[0].EndDate.hours(0);
                //Lets now create a new field on the segment to hold the string representation.
                appl.Segments[0].StartDateString = appl.Segments[0].StartDate.format("MM/DD/YYYY");
                appl.Segments[0].EndDateString = appl.Segments[0].EndDate.format("MM/DD/YYYY");
                emptySegment.StartDateString = emptySegment.StartDate.format("MM/DD/YYYY");
                emptySegment.EndDateString = emptySegment.EndDate.format("MM/DD/YYYY");

                segments.push(emptySegment);
                segments.push(appl.Segments[0]);
            } else {
                emptySegment.EndDate = moment(emptySegment.StartDate).utc();
                // Default to a 7 day empty segment
                emptySegment.EndDate.add(7, 'd');
                emptySegment.EndDate.hour(0);
                //Lets now create a new field on the segment to hold the string representation.
                emptySegment.StartDateString = emptySegment.StartDate.format("MM/DD/YYYY");
                emptySegment.EndDateString = emptySegment.EndDate.format("MM/DD/YYYY");
                segments.push(emptySegment);
            }
        } else {
            //Turn the dates in to moment objects
            appl.Segments[0].StartDate = moment(appl.Segments[0].StartDate).utc();
            appl.Segments[0].EndDate = moment(appl.Segments[0].EndDate).utc();
            //Set hours back to 0
            appl.Segments[0].StartDate.hours(0);
            appl.Segments[0].EndDate.hours(0);
            appl.Segments[0].StartDateString = appl.Segments[0].StartDate.format("MM/DD/YYYY");
            appl.Segments[0].EndDateString = appl.Segments[0].EndDate.format("MM/DD/YYYY");
            segments.push(appl.Segments[0]);
        }

        var ped;
        // If there are more segments lets navigate through them and add empty segments if needed.
        if(appl.Segments.length > 0){
            //ped is previous end date
            ped = moment(appl.Segments[0].EndDate);

            for(var i = 1; i < appl.Segments.length; i++){
                //csd is current start date
                var csd = moment(appl.Segments[i].StartDate);
                if(1 == csd.diff(ped, 'd')) {
                    //Turn the dates in to moment objects
                    appl.Segments[i].StartDate = moment(appl.Segments[i].StartDate).utc();
                    appl.Segments[i].EndDate = moment(appl.Segments[i].EndDate).utc();
                    //Set hours back to 0
                    appl.Segments[i].StartDate.hour(0);
                    appl.Segments[i].EndDate.hour(0);

                    //Lets now create a new field on the segment to hold the string representation.
                    appl.Segments[i].StartDateString = appl.Segments[i].StartDate.format("MM/DD/YYYY");
                    appl.Segments[i].EndDateString = appl.Segments[i].EndDate.format("MM/DD/YYYY");
                    segments.push(appl.Segments[i]);
                } else {
                    //prep new empty segment
                    emptySegment = new Object();
                    emptySegment.StartDate = moment(ped.add(1, 'd')).utc();
                    // cur start date to set new end date
                    emptySegment.EndDate = moment(csd.subtract(1, 'd')).utc();

                    //Turn the dates in to moment objects
                    appl.Segments[i].StartDate = moment(appl.Segments[i].StartDate).utc();
                    appl.Segments[i].EndDate = moment(appl.Segments[i].EndDate).utc();

                    //Set hours back to 0
                    appl.Segments[i].StartDate.hour(0);
                    appl.Segments[i].EndDate.hour(0);

                    //Lets now create a new field on the segment to hold the string representation.
                    appl.Segments[i].StartDateString = appl.Segments[i].StartDate.format("MM/DD/YYYY");
                    appl.Segments[i].EndDateString = appl.Segments[i].EndDate.format("MM/DD/YYYY");
                    emptySegment.StartDateString = emptySegment.StartDate.format("MM/DD/YYYY");
                    emptySegment.EndDateString = emptySegment.EndDate.format("MM/DD/YYYY");
                    segments.push(emptySegment);
                    segments.push(appl.Segments[i]);
                }
                //update previous end date
                ped = moment(appl.Segments[i].EndDate);
            }
        }
        //Add in the last segment
        if(ped){
            emptySegment = new Object();
            emptySegment.StartDate = moment(ped.add(1, 'd')).utc();
            emptySegment.EndDate = moment(ped.add(7, 'd')).utc();
            emptySegment.StartDateString = emptySegment.StartDate.format("MM/DD/YYYY");
            emptySegment.EndDateString = emptySegment.EndDate.format("MM/DD/YYYY");
            segments.push(emptySegment);
        }
        //finish up by setting the Segments to equal the new fully filled list of segments.
        $scope.app.Segments = segments;
    })
    .error(function(data, status) {
        $scope.app = data.results || "Request failed";
        $scope.status = status;
    });
}

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
}

function newStaffCtrl($scope, $http, $route, $routeParams){
    $scope.form = {};
    $scope.staffName ="";
    $scope.staffPrimary ="";

    $scope.form.submit = function (item, event) {
        var dataObject = {
            Name: $scope.form.staffName,
            Phone: $scope.form.staffPrimary
        };
        var responsePromise = $http.post("/api/applications/" + $routeParams.appName + "/staff/", dataObject, {});
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data);
            alert(data.Message);
        });
    };
}

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
}

function removeModalCtrl($scope, $modalInstance){
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

function editAppCtrl($scope, $http, $route, $routeParams){
    $scope.form = {};
    $scope.form.appPhone ="";
    $scope.form.appFallback ="";

    $http({method: 'GET', url: '/api/applications/' + $routeParams.appName}).
        success(function(data, status) {
        $scope.status = status;
        $scope.app = data.results;

        $scope.form.appPhone = $scope.app.Phone;
        if ($scope.app.Fallback) {
            $scope.form.appFallback = $scope.app.Fallback;
        }
    })
    .error(function(data, status) {
        $scope.app = data.results || "Request failed";
        $scope.status = status;
    });

    $scope.form.submit = function (item, event) {
        var dataObject = {
            Phone: $scope.form.appPhone,
            Fallback: $scope.form.appFallback._id
        };
        var responsePromise = $http.put("/api/applications/" + $routeParams.appName, dataObject, {});
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data.Message);
        });
    };

    $scope.getStaffString = function(staff) {
        return staff.Name + " - " + staff.Primary;
    }
}

function editStaffCtrl($scope, $http, $route, $routeParams){
    $scope.isEditingStaff = false;
    $scope.form = {};
    //$scope.form.staffName = "boob";
    
    $scope.form.submit = function (item, event) {
        var dataObject = {
            Name: $scope.form.staffName,
            Phone: $scope.form.staffPrimary
        };
        var responsePromise = $http.put("/api/applications/" + $routeParams.appName + "/staff/" + $scope.form.oldPrimary.split(" ").join(""), dataObject, {});
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data.Message);
        });
    };

}

function removeStaffCtrl($scope, $http, $route, $routeParams){

    $scope.removeStaff = function (Primary) {
        var responsePromise = $http.delete("/api/applications/" + $routeParams.appName + "/staff/" + Primary.split(" ").join(""));
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data.Message);
        });
    };

}

function segmentCtrl($scope, $http, $modal, $route, $routeParams, $location){
    $scope.isSegmentActive = false;
    $scope.form = {};

    $scope.dateOptions = {
        showWeeks: false,
        showButtonBar: false
    };

    $scope.datepickers = {
        StartOpen: false,
        EndOpen: false
    };

    $scope.open = function($event, which) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.closeAll();
        $scope.datepickers[which]= true;
    };

    $scope.closeAll = function() {
        $scope.datepickers.StartOpen = false;
        $scope.datepickers.EndOpen = false;
    };

    $scope.removeSegment = function (size) {
        var modalInstance = $modal.open({
            templateUrl: 'removeSegmentModal.jade',
            controller: 'removeModalCtrl',
            size: size
        });

        modalInstance.result.then(function () {
            var sd = $scope.form.StartDate.split('/').join('-');
            var responsePromise = $http.delete("/api/applications/" + $routeParams.appName + "/segments/" + sd, {});
            responsePromise.success(function (data, status) {
                //alert(data.results.StartDate);
                $route.reload();
            });
            responsePromise.error(function (data, status) {
                alert(data);
            });
        });
    };

    $scope.addSegment = function () {
        var dataObject = {
            StartDate: $scope.form.StartDate,
            EndDate: $scope.form.EndDate,
            PrimaryStaff: $scope.form.PrimaryStaff.Primary,
            SecondaryStaff: $scope.form.SecondaryStaff.Primary
        };
        var responsePromise = $http.post("/api/applications/" + $routeParams.appName + "/segments/", dataObject, {});
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data.Message);
        });
    };

    $scope.editSegment = function () {
        var dataObject = {
            PrimaryStaff: $scope.form.PrimaryStaff.Primary,
            SecondaryStaff: $scope.form.SecondaryStaff.Primary
        };
        var sd = $scope.form.StartDate.split('/').join('-');
        var responsePromise = $http.put("/api/applications/" + $routeParams.appName + "/segments/" + sd, dataObject, {});
        responsePromise.success(function (data, status) {
            $route.reload();
        });
        responsePromise.error(function (data, status) {
            alert(data.Message);
        });
    };

    $scope.getStaffString = function(staff) {
        return staff.Name + " - " + staff.Primary;
    }
}