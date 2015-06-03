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