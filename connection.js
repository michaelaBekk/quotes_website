// Config File
const config = require('./config');

//My SQL
const mySql = require('mysql');

const mySqlDb = mySql.createConnection(config.development);

mySqlDb.connect(function(err) {
    if (err) {
        console.log(err, 'Failed to connect to MySQL')
    }
    console.log("Connected to MySQL!");
});

mySqlDb.query(`USE ${config.development.database}`);