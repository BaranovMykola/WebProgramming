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

function adm(req,res)
{
	var info = {user:req.session.user,admin:req.session.admin,err_mess:"Permission denied!"};
	if(req.session.admin)
	{
			if(!req.query.page)
			{
				req.query.page= 0;
			}

			
			info.page = req.query.page;
			var cat = [];
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				const query = client.query("SELECT * FROM catalog ORDER BY id");
				query.on('row', (row) => {
					cat.push(row);
				});
				query.on('end', () => {
				  done();
				  info.catalog = cat;
				 // console.log(cat);
				  console.log('info.page = ' + info.page);
				  res.render('admin', info);
				});
			});
		
	}
	else
	{
		res.render('error', info);
	}
}

function deleteItem(req, res, id, next)
{
	pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				const query = client.query("DELETE FROM catalog where id = "+id);
				query.on('row', (row) => {
				});
				query.on('end', () => {
				  done();
				  next(req,res);
				});
			});
}

app.get('/admin',  function (req, res) {
	if(req.query.act && req.query.id && req.query.act=="delete")
	{
		console.log('start deleting');
			deleteItem(req,res,req.query.id,adm);
	}
	else
	{
		adm(req,res);
	}
});

var formidable = require('formidable');

function addItem(req,res,next)
{
	
	var form = new formidable.IncomingForm();
	console.log("formidable passed");
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
		
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);
			console.log("old path = " + old_path);

        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {
                        res.status(200);
                        res.json({'success': true});
                    }
                });
            });
        });
    });
	
	form.on('error', function(err) { console.log(err); });
	form.on('aborted', function() { console.log('Aborted'); });
	
	
			var info = {user:req.session.user,admin:req.session.admin,err_mess:"You price or discount are invalid"};
			var name = req.body.name;
			var id = req.body.id;
			var descr = req.body.descr;
			var img = req.body.image;
			console.log("img = "+img);
			var price = parseInt(req.body.price);
			var disco = parseInt(req.body.discount);
			if(req.body.discount == "0")
			{
				disco = "0";
			}
			console.log("disco = "+	disco);
			if(price == "" || disco == "")
			{
				
				res.render('error', info);
			}
			else
			{
					//console.log("start generatin query");
					var str = "insert into catalog (name,description, img, price, discount) values('"+name+"', '"+descr+"', '"+img+"', "+price+", "+disco+")";
					//console.log(str);
					pg.connect(connectionString, (err, client, done) => {
					if(err) {
					  done();
					  console.log(err);
					  res.render('error', info);
					}
					else
					{
						const query = client.query(str);
						query.on('row', (row) => {
						});
						query.on('end', () => {
						  done();
						  next(req,res);
						});
					}
				});
			}
}

app.post('/admin', function(req,res)
{

	var info = {user:req.session.user,admin:req.session.admin,err_mess:"Permission denied!"};
	if(req.session.admin)
	{
		if(req.body.act == "new")
		{
			addItem(req,res,adm);
		}
		else
		{
			var name = req.body.name;
			var id = req.body.id;
			var descr = req.body.descr;
			var img = req.body.image;
			var price = req.body.price;
			var disco = req.body.discount;
			console.log("name = " +name);
			console.log("img = " +img);
			var q = "UPDATE catalog SET name = '"+name+"', price = "+price+", img = '"+img+"', description = '"+descr+"', discount = "+disco+" WHERE id = "+id;
			console.log("query = " + q);
		
			pg.connect(connectionString, (err, client, done) => {
					if(err) {
					  done();
					  console.log(err);
					  return res.status(500).json({success: false, data: err});
					}
					console.log('query start');
					const query = client.query(q);
					query.on('row', (row) => {
						console.log("updated "+row);
					});
					query.on('end', () => {
					  done();
					  adm(req,res);
					});
				});	
		}
	}
	else
	{
		res.render('error', info);
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
			if(!req.query.page)
			{
				req.query.page= 0;
			}
			if(!req.query.sort) req.query.sort = "name";
			if(!req.query.order) req.query.order = "asc"
			const rows = [];
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				console.log('query start');
				const query = client.query("SELECT * FROM catalog order by " + req.query.sort + " " + req.query.order);
				query.on('row', (row) => {
					rows.push(row);
					console.log(row);
					row.price = row.price-row.discount;
				});
				query.on('end', () => {
				  done();
				  console.log(rows.length);
				  res.render('catalog', {user:req.session.user,admin:req.session.admin, catalog:rows,page:req.query.page, order:req.query.order, sort:req.query.sort});
				});
			});
			
	
});

app.get('/buy', function (req, res) {
	
		var item;
		if(req.session.user)
		{
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
		}
		else
		{
			res.render('error', {user:req.session.user,admin:req.session.admin,err_mess:"You have not been authenticated yet!"});
		}
	
});




module.exports = app;