angular.module('app')
     .controller('LoginController', function($scope, $rootScope,LoginServei, $location) {
         $scope.login = function(username,password) {
            if (!username || !password) {
                $scope.error = "Has d'emplenar tots els camps";
            } else{
                LoginServei.login(username,password,
                    function(error,status) {
                        if (status == 401) {
                                $scope.error = error.missatge;
                        }
                    }).success(function() {
                        LoginServei.getUser().then(function(user){
                            $rootScope.$broadcast('login', user.data); 
                            $location.path('/');
                        });
                    });
            }
        };
      });