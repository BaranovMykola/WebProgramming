const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
//var cookieParser = require('cookie-parser');
const pg = require('pg');
const path = require('path');
var connectionString = "postgres://postgres:1111@127.0.0.1:5432/Tasks";
var pgClient = new pg.Client(connectionString);

const exec = require("child_process").exec
var s = 1;

app.post('/do', function (req,res)
{
	var rows = [];
										  pg.connect(connectionString, (err, client, done) => {
										if(err) {
										  done();
										  console.log(err);
										  return res.status(500).json({success: false, data: err});
										}
										const query = client.query("select * from files where task = " + req.query.task);
										query.on('row', (row) => {
											rows.push(row);
											console.log('found file! --> ' + row.file);
											
												exec('D:/Studying/Programming/Projects/WebProgramming/Servers/assets/LaserTracking.exe assets/'+row.file+' assets/'+row.result, function callback(error, stdout, stderr){
				
												});											
												
										});
										query.on('end', () => {
										  done();
											res.send('sent');
										});
									});
									
});

function lgg()
{
	console.log('lgg');
}

module.exports = app;