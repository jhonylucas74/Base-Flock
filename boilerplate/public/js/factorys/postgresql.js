var postgresql = angular.module('postgresql', []);

postgresql.factory('psql', function($http, $q){
  // Postgresql module
  var pg = require('pg');

  // Run any sql
  function _runSql(sql, conString){
    var q = $q.defer();

    pg.connect(conString, function(err, client, done) {

      var query = client.query(sql,function(err, result) {
         if(err) {
            q.reject(String(err));
          }
      });

      var results = [];

      query.on('row', function(row) {
          results.push(row);
      });

      query.on('end', function() {
          client.end();
          q.resolve(results);
      });

      if(err) {
        console.log(err);
      }

    });

    return q.promise;
  }

  // Get all bases of bd
  function getBases(){
    var q = $q.defer();

    var sql  = 'SELECT datname FROM pg_database WHERE datistemplate = false;';
    var conString = 'postgres://localhost:5432/';

    _runSql(sql, conString).then(function(res) {
      console.log(res);
      var data = res;
      var result = [];

      for (var i = 0; i < data.length; i++) {
        result.push({ name: data[i].datname, class: null });
      }
      // return with sucess
      q.resolve(result);

    }, function(data) {
      q.reject(data);
    });

    return q.promise;
  }

  // GET all tables of base
  function getTables(base){
    var q = $q.defer();

    var sql  = "SELECT table_name FROM information_schema.tables "
        sql += "WHERE table_type = 'BASE TABLE' AND table_schema = 'public' "
        sql += "ORDER BY table_type, table_name;";

    var conString = 'postgres://localhost:5432/' + base;

    _runSql(sql, conString).then(function(res) {
      var data = res;
      var result = [];

      for (var i = 0; i < data.length; i++) {
        result.push({ name: data[i].table_name, class: null });
      }
      // return with sucess
      q.resolve(result);

    }, function(data) {
      q.reject(data);
    });

    return q.promise;
  }

  function getSelectTable(table){
    var q = $q.defer();
    var base = localStorage.getItem("base");

    var sql = "select * from " + table + ";";
    var conString = 'postgres://localhost:5432/' + base;

    _runSql(sql, conString).then(function(res) {
      // return with sucess
      q.resolve(res);

    }, function(data) {
      q.reject(data);
    });

    return q.promise;
  }

  function getTableSchema(table){
    var q = $q.defer();
    var base = localStorage.getItem("base");

    var sql  = "select column_name, data_type, character_maximum_length, column_default"
		    sql += " from INFORMATION_SCHEMA.COLUMNS where table_name = '" + table + "';"
    var conString = 'postgres://localhost:5432/' + base;

    _runSql(sql, conString).then(function(res) {
      // return with sucess
      q.resolve(res);

    }, function(data) {
      q.reject(data);
    });

    return q.promise;
  }

  function getExecuteSql(sql){
    var q = $q.defer();
    var base = localStorage.getItem("base");

    var conString = 'postgres://localhost:5432/' + base;

    _runSql(sql, conString).then(function(res) {
      // return with sucess
      q.resolve(res);

    }, function(data) {
      q.reject(data);
    });

    return q.promise;
  }

  return {
    getBases: getBases,
    getTables: getTables,
    getSelectTable: getSelectTable,
    getTableSchema: getTableSchema,
    getExecuteSql: getExecuteSql
  }
});
