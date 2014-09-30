function IndexCtrl($scope, $http) {
    $http.get('/api/applications/').
        success(function (data, status, headers, config) {
            var app = new Object();
            app.Name = 'test';
            app.Phone = '(555) -555-5555';
            $scope.app = app;
        });
}