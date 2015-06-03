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