angular.module('app', ['ngResource','ngRoute','ngCookies', 'angularFileUpload']);
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
angular.module('app')
  .controller('ErrorController', function($scope, $location, UsersServei) {
      
  });
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
  angular.module('app')
    .service("LoginServei", function($http, $cookies, $rootScope, UsersServei) {
      var srv = this;
      srv.auth = false;
      var usuari;

      srv.cookie = function(token) {
        $http.defaults.headers.common['x-auth'] = token;
        return $http.get('/api/users/user').success(function(user) {
          srv.auth = true;
          usuari = user;
          $rootScope.$broadcast('login', user);
        });
      };

      srv.getUser = function() {
        return $http.get('/api/users/user');
      };
      srv.setUser = function(u) {
        usuari = u;
      };
      srv.getUsuari = function() {
        return usuari;
      };

      srv.login = function(username, password, noLogin) {
        return $http.post('/api/users/session', {
          username: username,
          password: password
        }).success(function(data, status) {
          $http.defaults.headers.common['x-auth'] = data;
          if (data) {
            srv.auth = true;

            UsersServei.srv.busca({id: username}, function (user) {
              usuari = user[0];
            })
          }
        }).error(function(error, status) {
          noLogin(error, status);
        });
      };
      this.registre = function(username, password) {
        return $http.post('/api/users/user', {
          username: username,
          password: password
        });
      };
      this.logOut = function() {
        srv.auth = false;
        usuari = null;
        delete $cookies['_GlG'];
        $http.defaults.headers.common['x-auth'] = "";
      };



      if ($cookies['_GlG']) {
        srv.cookie($cookies['_GlG']);
      }
    })
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
angular.module('app')
    .controller('registreCtrl', function($scope, $location, LoginServei) {
        $scope.registre = function(username, password, password2) {

            $scope.$watchGroup(['username', 'password', 'password2'], function(newVal, oldVal) {
                if (newVal != oldVal)
                    $scope.error = null;

            });
            if (!password || !password2 || !username) {
                $scope.error = "Has d'emplenar tots els camps";

            }
            else if (password === password2) {
                LoginServei.registre(username,password)
                    .success(function(user) {
                        $location.path('/login');
                    })
                    .error(function(error,status){
                        if (status == 409)
                            $scope.error = error.missatge;
                    });
            }
            else {
                $scope.error = "Les contrasenyes no són iguals";
            }
        };
    });
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
  angular.module('app')
    .service("TresorsServei", function($resource) {
      this.srv = $resource('/api/tresors/:id', null, {
        'update': {
          method: 'PUT'
        },
        'busca':{
          method: 'GET'
        }
      });

      this.edit = null;
      return this;
    });
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
  angular.module('app')
    .service("TripServei", function($resource) {
      this.srv = $resource('/api/tripulacio/:id', null, {
        'update': {
          method: 'PUT'
        },
        'busca':{
          method: 'GET', 
          isArray:false
        }
      });
      
      this.punt = $resource('/api/tripulacio/puntuacio/:id', null, {
        'update': {
          method: 'PUT'
        }
      });
      
      return this;
    });
angular.module('app')
  .controller('UsersController', function($scope, $location, UsersServei, $route, TripServei, FileUploader) {

    var uploader = $scope.uploader = new FileUploader({
      url: "/api/users/pujarimatge",
      alias: "imatge",
      removeAfterUpload: true
    });


    uploader.onBeforeUploadItem = function(item) {
      item.formData.push({
        usuari: $scope.usuari._id
      });
    };


    $scope.canviaImg = function() {
      $('#uploadFile').change(function() {
        $('#file1').attr('style', 'display:none;');
      });

      $("#file1").trigger('click');

    };

    $scope.reclutam = function(solicitud) {
      solicitudsUpdate("reclutam", solicitud);
    };

    $scope.borram = function(solicitud) {
      solicitudsUpdate("denega", solicitud);
    };


    function solicitudsUpdate(missatge, solicitud) {

      UsersServei.aceptarSolc.update({
        id: $scope.usuari._id
      }, {
        solicitud: solicitud,
        missatge: missatge
      }, function(user) {

        if (user.tripulacio) {
          TripServei.punt.update({
            id: user.tripulacio
          }, {
            puntuacio: user.puntuacio / 10,
            user: user
          }, function(tripulacio) {
            $route.reload();
          });

        }

        else {
          console.log("denegat");
        }
      });

    }


    var usuariname = UsersServei.view;
    if (usuariname != null) {
      $scope.usuari = null;
      UsersServei.srv.busca({
        id: usuariname
      }, function(users) {
        $scope.usuari = users[0];
      });

    }
    else {
      $location.path("/");
    }



  });
  angular.module('app')
    .service("UsersServei", function($resource) {
      this.srv = $resource('/api/users/:id', null, {
        'update': {
          method: 'PUT'
        },
        'busca':{
          method: 'GET', 
          isArray:true
        }
      });
      
      
      this.trip = $resource('/api/users/tripulacio/:id', null, {
        'update': {
          method: 'PUT'
        }
      });
      
      this.aceptarSolc = $resource('/api/users/aceptasol/:id', null, {
        'update': {
          method: 'PUT'
        }
      });
      
      this.busca = $resource('/api/users/buscador/:nom', null, {
        'update': {
          method: 'PUT'
        },
        'cerca':{
          method: 'GET', 
          isArray:false
        }
      });
      
      this.solicituds = $resource('/api/users/solicituds/:id', null, {
        'update': {
          method: 'PUT'
        }
      });

      this.view = null;
      return this;
    });
angular.module('app')
    .directive('mapa', function(TresorsServei, $location, $rootScope) {
        return {
            restrict: 'E',
            template: '<div id="map-canvas"></div>',
            link: function(scope, element) {
                var errors = 0;
                var map;
                var markers = [];
                var latAnterior = 0;
                var longAnterior = 0;
                var circle;


                function crea(lat, long) {
                    errors = 0;
                    scope.getLatlong(lat, long);
                    var mapCanvas = document.getElementById('map-canvas');
                    var w = $("#caixadelmapa").width();
                    var h = $(window).height();

                    $("#map-canvas").css("width", w);
                    $("#map-canvas").css("height", h * 0.7);
                    var posicioAnterior = new google.maps.LatLng(lat, long);
                    var mapOptions = {
                        disableDoubleClickZoom: true,
                        scrollwheel: false,
                        draggable: false,
                        disableDefaultUI: true,
                        center: posicioAnterior,
                        zoom: 19,
                        mapTypeId: google.maps.MapTypeId.SATELLITE
                    };
                    map = new google.maps.Map(mapCanvas, mapOptions);
                    $rootScope.temps = setInterval(geoMark, 2000);
                }

                function creaMarcadors(lat, long) {
                    errors = 0;
                    var GeoAnt = {
                        lat: latAnterior,
                        lng: longAnterior
                    }
                    if (GeoAnt.lat != Geo.lat || GeoAnt.lng != Geo.lng || scope.canvis) {
                        map.setCenter(new google.maps.LatLng(Geo.lat, Geo.lng));
                        scope.canvis = false;
                        marcadors(null);
                        var point = new google.maps.LatLng(lat, long);
                        var marker = new google.maps.Marker({
                            position: point,
                            map: map,
                            icon: 'images/ball.png'
                        });
                        marker.setMap(map);
                        markers.push(marker);

                        var opcionsColors = {
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#FF0000',
                            fillOpacity: 0.35,
                            map: map,
                            center: point,
                            radius: 30
                        };

                        circle = new google.maps.Circle(opcionsColors);

                        TresorsServei.srv.query(function(punts) {
                            for (var i = 0; i < punts.length; i++) {
                                point = {
                                    lat: punts[i].lat,
                                    lng: punts[i].long
                                };



                                //Nomes mostrare tresors si estan a menys de 300metres
                                var tripulacio;
                                
                                if (!punts[i].autor.tripulacio && !scope.getUser().tripulacio) {
                                    tripulacio = true;
                                } else {
                                    tripulacio = (punts[i].autor.tripulacio != scope.getUser().tripulacio._id);
                                }
                                
                                if (getDistance(point, Geo) < 300 && (punts[i].autor.username != scope.getUser().username) && punts[i].trobador == null && tripulacio) {
                                    var punt = new google.maps.LatLng(punts[i].lat, punts[i].long);
                                    var id = punts[i]._id;
                                    
                                    if (getDistance(point, Geo) < (30) && (punts[i].autor.username != scope.getUser().username)) {
                                        var marker = new google.maps.Marker({
                                            id: punts[i]._id,
                                            position: punt,
                                            map: map,
                                            icon: 'images/treasure.png',
                                            html: '<h1>' + punts[i].descripcio + '</h1><button id="' + punts[i]._id + '" class="btn btn-success" onclick="captura(' + 'id' + ')" >Captura!</button>',
                                            title: punts[i].descripcio
                                        });
                                        markers.push(marker);


                                        google.maps.event.addListener(marker, 'click', function() {
                                            captura(marker.id);
                                        });

                                    }
                                    else {
                                        marker = new google.maps.Marker({
                                            position: punt,
                                            map: map,
                                            icon: 'images/treasure.png',
                                            html: '<h1>' + punts[i].descripcio + '</h1>',
                                            title: punts[i].descripcio
                                        });
                                        markers.push(marker);
                                    }
                                }
                            }
                        });
                    }
                    latAnterior = lat;
                    longAnterior = long;
                }

                var rad = function(x) {
                    return x * Math.PI / 180;
                };

                function captura(e) {
                    scope.setTresor(e);
                }

                var getDistance = function(p1, p2) {
                    var R = 6378137;
                    var dLat = rad(p2.lat - p1.lat);
                    var dLong = rad(p2.lng - p1.lng);
                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
                        Math.sin(dLong / 2) * Math.sin(dLong / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c;
                    return d;
                };

                var Geo = {};


                function success(position) {
                    Geo.lat = position.coords.latitude;
                    Geo.lng = position.coords.longitude;
                    crea(Geo.lat, Geo.lng);
                }

                function error() {
                    $location.path('/Error');
                }

                function geo() {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(success, error);
                    }
                }




                function geoMark() {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(successMark, error);
                    }
                }


                function marcadors(map) {
                    if (circle != null) {
                        circle.setMap(map);
                    }
                    for (var i = 0; i < markers.length; i++) {
                        markers[i].setMap(map);
                    }
                    markers = [];
                }

                function successMark(position) {
                    Geo.lat = position.coords.latitude;
                    Geo.lng = position.coords.longitude;
                    creaMarcadors(Geo.lat, Geo.lng);
                }


                geo();
            }
        };
    });
angular.module('app')
    .directive('select2', function(TresorsServei, UsersServei) {
        return {
            restrict: 'E',
            template: '<select id="select2" class="js-data-example-ajax"><option value="3620194" selected="selected">select2/select2</option></select>',
            link: function(scope, element) {
                $("#select2").select2({
                    ajax: {
                        url: "api/users/cerca",
                        dataType: 'json',
                        delay: 250,
                        data: function(params) {
                            return {
                                id: params.term, // search term
                                page: params.page
                            };
                        },
                        processResults: function(data, page) {
                            return {
                                results: data.users
                            };
                        },
                        cache: true
                    },
                    escapeMarkup: function(markup) {
                        return markup;
                        
                        
                    }, // let our custom formatter work
                    minimumInputLength: 1,
                    templateResult: formatRepo, // omitted for brevity, see the source of this page
                    templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
                });

                function formatRepo(repo) {
                    
                    if (repo.loading) return repo.text;
                    
                    var markup = '<div><a href="/#/usuari" id="' + repo.username +'"onclick="usuari(this.id)">' + repo.username + '</a></div>';
                    markup += '</div></div>';
                    return markup;
                }

                function formatRepoSelection(repo) {
                    return repo.username || repo.puntuacio;
                }
                
                window.usuari = function(e) {
                    scope.$parent.reload();
                    UsersServei.view = e;
                }
                
            }
        }
    });