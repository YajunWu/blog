
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings'); 

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
  	secret: settings.cookieSecret,
  	store: new MongoStore({
  		db: settings.db
  	})
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.all('/', routes.checkNotLogin);
app.get('/', routes.login);
//app.post('/', routes.checkNotLogin);
app.post('/',routes.loginning);
app.all('/login', routes.checkNotLogin);
app.get('/login', routes.login);
app.all('/logout', routes.checkLogin)
app.get('/logout', routes.logout);
//app.post('/login', routes.checkNotLogin);
app.post('/login',routes.loginning);
app.all('/reg', routes.checkNotLogin);
app.get('/reg', routes.reg);
//app.post('/reg', routes.checkNotLogin);
app.post('/reg',routes.regging);
app.get('/showArticle/:userName/:articleId', routes.checkUser);
app.get('/showArticle/:userName/:articleId', routes.showArticle);
//app.post('/masterHome', routes.masterHome);
app.get('/masterHome/:userName', routes.checkUser);
app.get('/masterHome/:userName', routes.masterHome);
app.get('/publishBlog/:userName', routes.checkUser);
app.get('/publishBlog/:userName', routes.publishBlog);
app.post('/publishBlog/:userName', routes.addBlog);
app.get('/publishBlog/:userName', routes.publishBlog);
app.get('/masterStore/:userName', routes.checkUser);
app.get('/masterStore/:userName', routes.masterStore);
app.get('/masterMessage/:userName', routes.checkUser);
app.get('/masterMessage/:userName', routes.masterMessage);
app.get('/masterInfo/:userName', routes.checkUser);
app.get('/masterInfo/:userName', routes.masterInfo);
app.get('/categories/:userName', routes.checkUser);
app.get('/categories/:userName', routes.categories);
app.post('/categories/:userName', routes.addCategory);
app.delete('/categories/:userName', routes.delCategory);
app.put('/categories/:userName', routes.renameCategory);
//dynamic view
app.dynamicHelpers({
  bloger: function(req, res) {
    return req.params.userName;
  },
  user: function(req, res) {
    return req.session.user;
  },
  error: function(req, res) {
    var err = req.flash('error');
    if (err.length) {
      return err;
    } else {
      return null;
    }
  },
  success: function(req, res) {
    var succ = req.flash('success');
    if (succ.length) {
      return succ;
    } else {
      return null;
    }
  }
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
