var cassandra_driver = require('cassandra-driver');

var db = {};

db.connectCassandra = function(next) {

    var options = {
        contactPoints: (process.env.CASSANDRA_HOSTS || 'localhost').split(','),
        keyspace: process.env.CASSANDRA_KEYSPACE || 'hoofit'
    };

    var cassandra = new cassandra_driver.Client(options);
    cassandra.connect(function(err) {
        next(err, cassandra);
    });

};

module.exports = db;
