angular.module('app')
  .controller('IndexController', function($scope, $location, UsersServei, TripServei) {

    $scope.users = [];

    UsersServei.srv.query(function(users) {
      $scope.users = users.slice(0, 5);
    });
    
    TripServei.srv.query(function(trips) {
      $scope.tripulacions = trips.slice(0, 5);
    });
    
    
  });