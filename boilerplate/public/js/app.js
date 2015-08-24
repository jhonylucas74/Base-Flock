var app = angular.module('baseFlock', ['ngRoute', 'postgresql']);

app.config(['$routeProvider',
  function($routeProvider) {
    var route = $routeProvider;

    route.when('/', {
      templateUrl: 'views/welcome.html'
    });

    route.when('/base', {
      templateUrl: 'views/base.html'
    });

    route.when('/table/:name', {
      templateUrl: 'views/base.html',
      controller: 'Table',
      cache: false
    });

    route.otherwise({
      redirectTo: '/'
    });

  }]);


app.controller('leftMenu', function($scope, psql, $window){

   $scope.bases = [];

   psql.getBases().then(function(res){
     $scope.bases = res;
   });

   $scope.tables = [];


   $scope.selectBase = function(index) {
      for (var i = 0; i < $scope.bases.length; i++) {
        $scope.bases[i].class = 'disabled';
      }

      $scope.bases[index].class = 'focus';

      psql.getTables($scope.bases[index].name).then(function(res){
        $scope.tables  = res;
      });

      localStorage.setItem('base', $scope.bases[index].name);
      $window.location = '#/base';
   };

   $scope.selectTable = function(index) {
      for (var i = 0; i < $scope.tables.length; i++) {
        $scope.tables[i].class = 'disabled';
      }

      $scope.tables[index].class = 'focus';
      $window.location = '#/table/' + $scope.tables[index].name ;
   };


});


app.controller('Table', function($scope, psql, $routeParams) {

  var table = $routeParams.name;
  setTableWidth('box-table', 'table');

  if (table != null){
    psql.getSelectTable(table).then(function(res){
      $scope.result = res;
      if(res[0]) $scope.fields = Object.keys(res[0]);
    });

    psql.getTableSchema(table).then(function(res){
      $scope.schema = {};
      $scope.schema.result = res;
      if(res[0]) $scope.schema.fields = Object.keys(res[0]);
    });
  }

  $scope.executeSql = function(){

    psql.getExecuteSql($scope.sql).then(function(res){
      $scope.err = null;
      $scope.schema = null;
      $scope.result = res;
      if(res[0]) $scope.fields = Object.keys(res[0]);
    }, function(data){
      $scope.err = data;
    });
  };

});


/* JS ajustes no layout
-------------------------------------------------------------------*/

// set a correct width to table
function setTableWidth(contentId, tableID) {
  var eleContentWidth = document.getElementById(contentId).offsetWidth;
  var eleTableWidth   = document.getElementById(tableID).offsetWidth;
  //console.log(eleContentWidth);
  //console.log(eleTableWidth);
  if(eleTableWidth < eleContentWidth) {
    document.getElementById(tableID).style.width = "100%";
  }
}
