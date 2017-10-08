const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
//var cookieParser = require('cookie-parser');
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL
    || 'postgres://postgres:123@localhost:5432/todo';

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
 
// Login endpoint
app.post('/login', function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.render('/login', {user:req.session.user, message: 'Authentication failed'});
  } else if(req.body.username === "amy" || req.body.password === "1") {
    req.session.user = "amy";
    req.session.admin = true;
    res.render('index', {user:req.session.user});
	//return res.redirect('/index');res.redirect('/index/');
	//res.send('ok');
  }
  else
  {
	  res.render('/login', {user:req.session.user, message: 'Authentication failed'});
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