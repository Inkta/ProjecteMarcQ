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