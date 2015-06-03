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