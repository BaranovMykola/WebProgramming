const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
//var cookieParser = require('cookie-parser');
const pg = require('pg');
const path = require('path');
var connectionString = "postgres://postgres:1111@127.0.0.1:5432/online_shop";
var pgClient = new pg.Client(connectionString);

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
//app.use(cookieParser("2C44-4D44-WppQ38S"));
 
// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && req.session.user === "amy" && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};

function onConnect(err, client, done) {
  //Err - This means something went wrong connecting to the database.
  if (err) {
    console.error('err');
    process.exit(1);
  }

  //For now let's end client
  client.end();
}
 
// Login endpoint
app.post('/login', function (req, res) {
	var auth = false;
	if (!req.body.username || !req.body.password) {
		auth = true;
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
 
// Get content endpoint
app.get('/content', auth, function (req, res) {
    res.send("You can only see this after you've logged in.");
});
 
app.listen(3000);
console.log("app running at http://localhost:3000");

app.get('/', (req, res, next) => {
  res.render(
  'index.ejs',	
  {user:req.session.user, admin:req.session.admin});
});


app.post('/signup', function (req, res) {
	var err = false;
	if (!req.body.username || !req.body.password || !req.body.password_repeat) {
		err = true;
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
						res.render('index', {user:login});
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

app.get('/admin',  function (req, res) {
	var info = {user:req.session.user,admin:req.session.admin};
	if(req.session.admin)
	{
		res.render('admin', info);
	}
	else
	{
		res.render('index', info);
	}
});

function cat(req,res)
{
	const rows = [];
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				console.log('query start');
				const query = client.query("SELECT * FROM catalog");
				query.on('row', (row) => {
					rows.push(row);
					console.log(row);
				});
				query.on('end', () => {
				  done();
				  console.log(rows.length);
				  res.render('catalog', {user:req.session.user,admin:req.session.admin, catalog:rows});
				});
			});
}

app.get('/catalog', function (req, res) {
	
			const rows = [];
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				console.log('query start');
				const query = client.query("SELECT * FROM catalog");
				query.on('row', (row) => {
					rows.push(row);
					console.log(row);
				});
				query.on('end', () => {
				  done();
				  console.log(rows.length);
				  res.render('catalog', {user:req.session.user,admin:req.session.admin, catalog:rows});
				});
			});
			
	
});

app.get('/buy', function (req, res) {
	
		var item;
		if(req.query.act)
		{
			console.log('act defined!');
			console.log(req.query.act);
			if(req.query.act == "delete")
			{
				for(var i =0;i<req.session.store.length;++i)
				{
					if(req.session.store[i].id == req.query.id)
					{
						req.session.store.splice(i,1);
					}
				}
				res.render('buy', {user:req.session.user,admin:req.session.admin,store:req.session.store,total:false});	
			}
			else if(req.query.act == "buy")
			{
				console.log('act == buy!');
				var totalPrice = 0;
				for(var i =0;i<req.session.store.length;++i)
				{
					totalPrice+=req.session.store[i].price;
				}
				req.session.store = [];
				var storeTotal = [];
				storeTotal.push(({img :"bucket.png",name:"Total", description:"",price:totalPrice}));
				res.render('buy', {user:req.session.user,admin:req.session.admin,store:storeTotal,total:true});	
			}
			console.log('not buy?');
		}
		else if(req.query.id)
		{
				pg.connect(connectionString, (err, client, done) => {
					if(err) {
					  done();
					  console.log(err);
					  return res.status(500).json({success: false, data: err});
					}
						const query = client.query("SELECT * FROM catalog where id = " +req.query.id);
						query.on('row', (row) => {
							item = row;
							//console.log(row);
					});
					query.on('end', () => {
					  done();
					  req.session.store.push(item);
					  console.log(req.session.store);
					  res.render('buy', {user:req.session.user,admin:req.session.admin,store:req.session.store,total:false});
					});
				});
		}
		else
		{
			res.render('buy', {user:req.session.user,admin:req.session.admin,store:req.session.store,total:false});
		}
	
});

//app.get('/store'


module.exports = app;