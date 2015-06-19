var async = require('async');
var fs = require('fs');
var babyparse = require('babyparse');
var db = require('./lib/db.js');

function getAllUsers(cassandra, next) {

    var users = [];
    var cql = "SELECT uuid, name, level, created, updated, bot FROM users;";

    cassandra.eachRow(cql, [], {autoPage: true}, function(n, row) {
        process.stdout.write('.');
        var user = {
            uuid: row.uuid.toString(),
            name: row.name,
            level: row.level,
            created: row.created,
            updated: row.updated,
            bot: row.bot
        };
        users.push(user);
    }, function(err) {
        if (err) return next(err);
        console.log("Total users: " + users.length);
        next(null, users);
    });

}

function makeResult(users, next) {

    var csv = babyparse.unparse(users);
    var output = (process.argv && process.argv[2]) ? process.argv[2] : "all-users";
    var filename = output+".csv";

    fs.writeFile(filename, csv.toString(), function(err) {
        if (err) return next(err);
        next(null, csv);
    });

}

function main() {
    async.waterfall([
        function(done) {
            async.parallel({
                cassandra: db.connectCassandra
            }, function(err, res) {
                done(err, res.cassandra);
            });
        },
        async.apply(getAllUsers),
        async.apply(makeResult)
    ], function(err) {
        if (err) return console.log("Error: " + err);
        console.log("Completed!");
    });
}

main();


