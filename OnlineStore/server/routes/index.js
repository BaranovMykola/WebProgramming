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
  if (!req.body.username || !req.body.password) {
    res.render('login', {user:req.session.user, message: 'Authentication failed'});
  } else 
  {
	console.log("okay");
		pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
	const query = client.query('SELECT * FROM users');
    query.on('row', (row) => {
      console.log(row);
    });
    query.on('end', () => {
      done();
      return null;
    });

  });
	
	res.send('str');
		

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
  {user:req.session.user});
});


//module.exports = router;


module.exports = app;