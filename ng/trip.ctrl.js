angular.module('app')
    .controller('tripController', function($scope, $location, UsersServei, $route, TripServei) {
        console.log($scope.currentUser);

        function getUser() {
            UsersServei.srv.busca({
                id: $scope.currentUser.username
            }, function(users) {
                $scope.usuari = users[0];
                console.log($scope.usuari);
                if ($scope.usuari.tripulacio != null) {
                    TripServei.srv.busca({
                        id: $scope.usuari.tripulacio._id
                    }, function(tripulacio) {
                        $scope.tripulacio = tripulacio;
                    })
                }
            });
        }
        getUser();

        $scope.creaTrip = function(nom) {

            if (!nom) {
                $scope.error = "Has de donarli un nom!";

            }
            else {
                TripServei.srv.save({
                    nom: nom,
                    puntuacio: $scope.usuari.puntuacio / 10,
                    membres: [$scope.usuari._id]
                }, function(trip) {
                    console.log(trip);
                    UsersServei.trip.update({
                            id: $scope.usuari._id
                        }, {
                            tripulacio: trip._id
                        },
                        function(user) {
                            $route.reload();
                        });
                });
            }
        };



        $scope.reclutar = function(mariner) {
            UsersServei.busca.cerca({
                nom: mariner
            }, function(user) {
                console.log(user);
                console.log(user.solicituds.indexOf($scope.usuari.tripulacio));
                if (user.username == null) {
                    $scope.solerror = "No existeix aquest mariner!";
                }
                else if (user.username == $scope.usuari.username) {
                    $scope.solerror = "No pots reclutar-te a tu mateix";
                } 
                else if (user.tripulacio) {
                    $scope.solerror = "Aquest mariner ja te tripulacio";
                }
                else if (user.solicituds.indexOf($scope.usuari.tripulacio._id) != -1) {
                    $scope.solerror = "Ja li has enviat solicitud";
                }
                else {
                    UsersServei.solicituds.update({
                        id: user._id
                    }, {
                        user: user,
                        solicituds: $scope.usuari.tripulacio
                    }, function(user) {
                        console.log(user);
                    });
                }
            });
        };
    });