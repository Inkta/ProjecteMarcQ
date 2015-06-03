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