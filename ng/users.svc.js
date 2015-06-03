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