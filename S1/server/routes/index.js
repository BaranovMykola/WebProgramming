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
																					
												
										});
										query.on('end', () => {
										  done();
										  start(rows,0);
										  res.redirect(307, 'http://localhost:4000/profile');
										});
									});
									
});

function lgg()
{
	console.log('lgg');
}

function start(inf,i)
{
	console.log('started program with param assets/'+inf[i].file+' '+inf[i].result);
	exec('D:/Studying/Programming/Projects/WebProgramming/Servers/assets/LaserTracking.exe assets/'+inf[i].file+' d:/Studying/Programming/Projects/WebProgramming/Servers/assets/'+inf[i].result, 
		function callback(error, stdout, stderr){
			console.log(stdout);
			
													  pg.connect(connectionString, (err, client, done) => {
										if(err) {
										  done();
										  console.log(err);
										  return res.status(500).json({success: false, data: err});
										}
										const query = client.query("update task set file = file+1 where id = " + inf[i].task);
										query.on('row', (row) => {
											console.log('files incremented');
																					
												
										});
										query.on('end', () => {
										  done();
										});
									});
									
											pg.connect(connectionString, (err, client, done) => {
										if(err) {
										  done();
										  console.log(err);
										  return res.status(500).json({success: false, data: err});
										}
										const query = client.query("update performance set threads = threads-1 where server = " + inf[i].server);
										query.on('row', (row) => {
											console.log('threads decremented');
																					
												
										});
										query.on('end', () => {
										  done();
										});
									});
			
			if(i+1 < inf.length)
			{
					start(inf,i+1);
			}
	});	
}

module.exports = app;