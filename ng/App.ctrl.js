angular.module('app')
  .controller('ApplicationController', function($scope, $compile, $cookies, $location, LoginServei, UsersServei, $route) {

    function movil() {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            }
            return false;
        }
        
        
    $scope.mobile = movil();

    $scope.infoUser = function(a) {
      $route.reload();
      UsersServei.view = a;
    };

    $scope.reload = function() {
      $route.reload();
    }



    $scope.$on('login', function(e, user) {
      $scope.currentUser = user;
    });

    $scope.logout = function() {
      LoginServei.logOut();
      delete $scope.currentUser;
      $location.path('/');
    };

  });