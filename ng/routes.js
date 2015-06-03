angular.module('app')
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when("/", {
                controller: 'IndexController',
                templateUrl: 'principal.html',
                autoritzat: false
            })
            .when("/registre", {
                controller: "registreCtrl",
                templateUrl: 'registre.html',
                autoritzat: false
            })
            .when("/login", {
                controller: "LoginController",
                templateUrl: "login.html",
                autoritzat: false
            })
            .when("/usuari", {
                controller: "UsersController",
                templateUrl: "usuari.html",
                autoritzat: false
            })
            .when("/Mapa", {
                controller: "MapController",
                templateUrl: "map.html",
                autoritzat: true
            })
            .when("/tripulacio", {
                controller: "tripController",
                templateUrl: "trip.html",
                autoritzat: true
            })
            .when('/Error', {
                controller: "ErrorController",
                templateUrl: "error.html",
                autoritzat: true
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }).run(function($rootScope, LoginServei, $location) {
        $rootScope.$on('$routeChangeStart', function(event, next) {
            clearInterval($rootScope.temps);
            if (next)
                if (!LoginServei.auth & next.autoritzat) {
                    event.preventDefault();
                    $location.path('/');
                }
        });
    });