/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: settings.cookieSecret,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
      db: settings.db
    })
  }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
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
app.get('/search/u/:userName', routes.checkUser);
app.get('/search/u/:userName', routes.search);
app.get('/showArticle/u/:userName/:minute', routes.checkUser);
app.get('/showArticle/u/:userName/:minute', routes.showArticle);
app.post('/showArticle/u/:userName/:minute', routes.addComment);
//app.post('/masterHome', routes.masterHome);
app.get('/masterHome/u/:userName', routes.checkUser);
app.get('/masterHome/u/:userName', routes.masterHome);
app.delete('/masterHome/u/:userName', routes.delArticle);
app.get('/publishBlog/u/:userName', routes.checkUser);
app.get('/publishBlog/u/:userName', routes.publishBlog);
app.post('/publishBlog/u/:userName', routes.addBlog);
app.get('/publishBlog/u/:userName', routes.publishBlog);
app.get('/masterStore/u/:userName', routes.checkUser);
app.get('/masterStore/u/:userName', routes.masterStore);
app.get('/masterMessage/u/:userName', routes.checkUser);
app.get('/masterMessage/u/:userName', routes.masterMessage);
app.get('/masterInfo/u/:userName', routes.checkUser);
app.get('/masterInfo/u/:userName', routes.masterInfo);
app.get('/categories/u/:userName', routes.checkUser);
app.get('/categories/u/:userName', routes.categories);
app.post('/categories/u/:userName', routes.addCategory);
app.delete('/categories/u/:userName', routes.delCategory);
app.put('/categories/u/:userName', routes.renameCategory);
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
