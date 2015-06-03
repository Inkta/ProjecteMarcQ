angular.module('app')
    .controller('MapController', function($scope, $location, TresorsServei, LoginServei, UsersServei, TripServei) {
        if (movil()) {

            $scope.canvis = true;

            var lat = 0;
            var long = 0;
            $scope.getLatlong = function(lat2, long2) {
                lat = lat2;
                long = long2;
            }

            $scope.getUser = function() {
                var user = LoginServei.getUsuari();
                return user;
            }


            $scope.setTresor = function(e) {
                TresorsServei.srv.busca({
                    id: e
                }, function(tresor) {
                    $scope.tresor = tresor;
                });


            }

            $scope.RecollirTresor = function(e) {
                if (e == null) {
                    $scope.tresor = null;
                    $scope.canvis = true;
                }
                else {
                    TresorsServei.srv.busca({
                        id: e
                    }, function(tresor) {
                        if (tresor.trobador == null) {
                            TresorsServei.srv.update({
                                    id: e
                                }, {
                                    trobador: $scope.currentUser._id
                                },
                                function(tresor) {
                                    UsersServei.srv.update({
                                        id: $scope.currentUser._id
                                    }, {
                                        tresor: tresor
                                    }, function(user) {
                                        console.log(user);

                                        TripServei.punt.update({
                                            id: user.tripulacio._id
                                        }, {
                                            puntuacio: 1,
                                            user: user
                                        }, function() {
                                        });


                                    });
                                });
                        }
                    });
                    $scope.tresor = null;
                    $scope.canvis = true;
                }
            }

            $scope.afegirTresor = function() {
                TresorsServei.srv.save({
                    descripcio: $scope.descripcio,
                    lat: lat,
                    long: long,
                    autor: $scope.currentUser._id,
                }, function() {
                    $location.path('/Mapa');
                });
            };

        }
        else {
            $location.path('/');
        }



        function movil() {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            }
            return false;
        }

    });