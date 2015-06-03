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