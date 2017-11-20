const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
//var cookieParser = require('cookie-parser');
const pg = require('pg');
var randomstring = require("randomstring");
const path = require('path');
var connectionString = "postgres://postgres:1111@127.0.0.1:5432/Tasks";
var pgClient = new pg.Client(connectionString);

const exec = require("child_process").exec

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true,
	
}));


app.set('view engine', 'ejs');

app.get('/', function(req,res){
	req.session.store = [];
	res.render('index.ejs', {user:req.session.user});
	
});

app.get('/load', function(req,res){
	res.render('load.ejs',{user:req.session.user});
	
});

app.post('/load', function(req,res){
//	exec('D:/Studying/Programming/Projects/WebProgramming/Servers/assets/LaserTracking.exe assets/'+req.body.file+' assets/'+req.body.result+'.jpg', function callback(error, stdout, stderr){
				
	//});
	var taskId;
	if(!req.session.user)
	{
		res.render('error.ejs', {err_mess:"You must be logged in",user:req.session.user});
	}
	else
	{
			
		
		pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query('select * from performance order by threads LIMIT 1');
			query.on('row', (row) => {
				
				s = row.server
				
				console.log('user='+req.session.user);
				console.log('files='+req.body.file.length);
				console.log('min='+s);
				
				
			});
			query.on('end', () => {
			  done();
				
							pg.connect(connectionString, (err, client, done) => {
						if(err) {
						  done();
						  console.log(err);
						  return res.status(500).json({success: false, data: err});
						}
						const query = client.query("insert into task (server,start,username,file,files) values("+s+",CURRENT_TIMESTAMP,'"+req.session.user+"',0,"+req.body.file.length+") returning id");
						query.on('row', (row) => {
							
							console.log("returned id = " + row.id);
							taskId = row.id;
							
							var str = "";
							if(!Array.isArray(req.body.file))
							{
								req.body.file = [req.body.file];
								console.log('handled');
							}
							console.log(req.body.file);
							for(var i =0;i<req.body.file.length;++i)
							{
								str += "('"+req.body.file[i]+"','"+randomstring.generate()+".jpg',"+s+","+row.id+")";
								if(i+1 != req.body.file.length)
								{
									str += ',';
								}
							}
							console.log('inserting //'+str+'//');
							
												pg.connect(connectionString, (err, client, done) => {
										if(err) {
										  done();
										  console.log(err);
										  return res.status(500).json({success: false, data: err});
										}
										const query = client.query("insert into files (file, result,server,task) values"+str);
										query.on('row', (row) => {
											
											
											
											
										});
										query.on('end', () => {
										  done();
										  
										});
												});
							
							
						});
						query.on('end', () => {
						  done();
						  
										  pg.connect(connectionString, (err, client, done) => {
										if(err) {
										  done();
										  console.log(err);
										  return res.status(500).json({success: false, data: err});
										}
										const query = client.query("update performance set threads = threads+"+req.body.file.length+" where server = "+s);
										query.on('row', (row) => {
											
											
											
											
										});
										query.on('end', () => {
										  done();
										  if(s == 1)
										  {
											  console.log(':5000 port');
											res.redirect(307, 'http://localhost:5000/do?task='+taskId);
										  }
										  else if (s == 2)
										  {
											  console.log(':8088 port');
											  res.redirect(307, 'http://localhost:8088/do?task='+taskId);
										  }
									
										});
									});
						  
						});
					});
			  
			});
		});
		
									

			
			
			
		//res.render('profile.ejs', {conf:req.session.store, user:req.session.user});//});
	}
});

function minServer()
{
	//select * from performance order by threads LIMIT 1
			pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query('select * from performance order by threads LIMIT 1');
			query.on('row', (row) => {
				console.log("min server = " + row.server);
				return row.server;
			});
			query.on('end', () => {
			  done();
			  
			});
		});
}


app.get('/profile', function(req,res){
	if(req.session.user)
	{
		var rows = [];
		pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("select * from task where username = '"+req.session.user+"'");
			query.on('row', (row) => {
				rows.push(row);
			});
			query.on('end', () => {
			  done();
				res.render('profile.ejs', {conf:rows, user:req.session.user});
			});
		});
		
		
	}
	else
	{
		res.render('error.ejs', {err_mess:"You must be logged in",user:req.session.user});
	}
});

app.get('/result', function(req,res){
	if(req.session.user)
	{
		var rows = [];
		pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("select * from files where task = "+req.query.task);
			query.on('row', (row) => {
				rows.push(row);
			});
			query.on('end', () => {
			  done();
				res.render('result.ejs', {conf:rows, user:req.session.user});
			});
		});
		
		
	}
	else
	{
		res.render('error.ejs', {err_mess:"You must be logged in",user:req.session.user});
	}
});

app.post('/login', function (req, res) {
	var auth = false;
	if (!req.body.username || !req.body.password) {
		res.render('login', {user:req.session.user, message: 'You should fill all fields!'});
	}
	else 
	{
		pg.connect(connectionString, (err, client, done) => {
		if(err) {
		  done();
		  console.log(err);
		  return res.status(500).json({success: false, data: err});
		}
		const query = client.query('SELECT * FROM users where username=($1)', [req.body.username]);
		query.on('row', (row) => {
			if(row.password == req.body.password)
			{
				auth = true;
				req.session.user = row.username;
				req.session.admin = row.admin;
				req.session.store = [];
			}
		});
		query.on('end', () => {
		  done();
		  if(auth == true)
		  {
			  res.render('index', {user:req.session.user, admin:req.session.admin});
		  }
		  else
		  {
			  res.render('login', {user:req.session.user, message: 'Authentication failed'});
		  }
		});
	});	
}


	  
  
});

app.get('/login', function(req, res)
{
	req.session.destroy();
	res.render('login.ejs', {user : null, message: null});
});
 
// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});

app.post('/signup', function (req, res) {
	var err = false;
	if (!req.body.username || !req.body.password || !req.body.password_repeat) {
		res.render('login', {user:req.session.user, message: 'You should fill all fields!'});
	}
	else 
	{
		var pas1 = req.body.password;
		var pas2 = req.body.password_repeat;
		var login = req.body.username;
		
		if(pas1 == pas2)
		{
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				const query = client.query('SELECT * FROM users where username=($1)', [req.body.username]);
				query.on('row', (row) => {
					err = true;
					console.log(row);
				});
				query.on('end', () => {
				  done();
				  	if(!err)
					{
						console.log('okay, create user');
						createUser(login, pas1, false);
						console.log('user created?');
						req.session.user = login;
						req.session.admin = false;
						res.render('index', {user:login,admin:req.session.admin});
					}
					else
					{
						res.render('login', {user:null, message: "Nickname already exists"});
					}
				});
			});
		}
		else
		{
			res.render('login', {user:null, message: "Passwords are not equals"});
		}
		
	
		
	}	
});


function createUser(nick, pass, adm)
{
	var str = "INSERT INTO users VALUES('"+nick+"', '"+pass+"', '"+adm+"')";
				pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				console.log('query start');
				const query = client.query(str);
				query.on('row', (row) => {
				});
				query.on('end', () => {
				  done();
				});
			});
}

app.get('/test1', function(req,res)
{
	res.redirect(307, 'http://localhost:5000/do?task=123');
});


module.exports = app;