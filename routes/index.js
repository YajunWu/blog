var url = require("url");
var crypto = require('crypto');//加密并生成各种散列
var User = require('../models/user.js');
var Category = require('../models/category.js');
var Article = require('../models/article.js');

/*
// Routes

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('login', { title: '登录', layout: 'logLayout' });
  });

  app.post('/', function(req, res) {
    console.log("login");
    res.render('masterHome', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/login', function(req, res) {
    res.render('login', { title: '登录', layout: 'logLayout' });
  });

  app.post('/login', function(req, res) {
    console.log("login");
    res.render('masterHome', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/reg', function(req, res) {
    res.render('reg', { title: '注册', layout: 'logLayout' });
  });

  app.post('/reg', function(req, res) {
    //生成密码的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.userPwd).digest('base64');

    var newUser = new User({
      name: req.body.userName,
      password: password,
      nickname: req.body.userNickname,
      mail:req.body.userMail
    });

    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user) {
      if(user)
        err = '用户名已经存在';
      if(err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      //如果不存在则新增用户
      newUser.save(function(err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        };
        req.session.user = newUser;
        req.flash('success', '注册成功');

        res.redirect('/masterHome/' + req.session.user.name);
      });
    });
  });
  app.get('/showArticle', function(req, res) {
    res.render('showArticle', { title: req.params.userName, layout: 'layout' });
  });

  app.post('/masterHome', function(req, res) {
    res.render('masterHome', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/masterHome', function(req, res) {
    res.render('masterHome', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/publishBlog', function(req, res) {
    res.render('publishBlog', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/masterStore', function(req, res) {
    res.render('masterStore', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/masterMessage', function(req, res) {
    res.render('masterMessage', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/masterInfo', function(req, res) {
    res.render('masterInfo', { title: req.params.userName, layout: 'layout' });
  });

  app.get('/modifyInfo', function(req, res) {
    res.render('modifyInfo', { title: req.params.userName, layout: 'layout' });
  });
}
*/

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: req.params.userName });
};

exports.login = function(req, res){
  res.render('login', { title: '登录', layout: 'logLayout' });
};

exports.loginning = function(req, res){
  //生成密码的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.userPwd).digest('base64');

  User.get(req.body.userName, function(err, user) {
    console.log("loginning");
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', '用户密码错误');
      return res.redirect('/login');
    }
    req.session.user = user;
    res.redirect('/masterHome/' + user.name);
  });
};

exports.logout = function(req, res) {
  req.session.user = null;
  req.flash('success', '退出成功');
  res.redirect('/login');
}

exports.reg = function(req, res){
  res.render('reg', { title: '注册', layout: 'logLayout' });
};

exports.regging = function(req, res){
  //生成密码的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.userPwd).digest('base64');

  var newUser = new User({
    name: req.body.userName,
    password: password,
    nickname: req.body.userNickname,
    mail:req.body.userMail
  });

  //检查用户名是否已经存在
  User.get(newUser.name, function(err, user) {
    if(user)
      err = '用户名已经存在';
    if(err) {
      req.flash('error', err);
      return res.redirect('/reg');
    }
    //如果不存在则新增用户
    newUser.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      };
      req.session.user = newUser;
      res.redirect('/masterHome/' + newUser.name);
    });
  });
};

exports.showArticle = function(req, res){
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/masterHome/' + req.params.userName);
    }
    Article.getOne(req.params.userName, req.params.articleId, function(err, article) {
      if(err || (article == null)) {
        req.flash('error', err);
        return res.redirect('/masterHome/' + req.params.userName);
      }
      console.log(article);
      res.render('showArticle', { title: req.params.userName, categoryList: categories, article:article, layout: 'layout' });
    });
  })
};

exports.masterHome = function(req, res){
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/login');
    }
    Article.get(req.params.userName, function(err, articles) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/login');
      }

      res.render('masterHome', { title: req.params.userName, categoryList: categories, articleList: articles, layout: 'layout' });
    
    });
  });
};

exports.publishBlog = function(req, res){
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/masterHome/' + req.params.userName);
    }
    res.render('publishBlog', { title: req.params.userName, categoryList: categories, layout: 'layout' });
  })
};

exports.addBlog = function(req, res){
  Article.getMaxId(function(err, id) {
    var newId = id + 1;
    var now = new Date();
    var newBlog = new Article({
      id: newId,
      author: req.params.userName,
      head: req.body.newBlogHead,
      tags: req.body.newBlogTags,
      content: req.body.newBlogContent,
      category: req.body.newBlogCategory,
      publishTime: now.getTime(),
      commentNum: 0,
      likeNum: 0
    });
    newBlog.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/publishBlog/' + req.params.userName);
      };
      res.redirect('/showArticle/' + req.params.userName + '/' + newId);
    });
  });

  
  
};

exports.masterStore = function(req, res){
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/masterHome/' + req.params.userName);
    }
    res.render('masterStore', { title: req.params.userName, categoryList: categories, layout: 'layout' });
  })
};

exports.masterMessage = function(req, res){
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/masterHome/' + req.params.userName);
    }
    res.render('masterMessage', { title: req.params.userName, categoryList: categories, layout: 'layout' });
  })
};

exports.masterInfo = function(req, res){
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/masterHome/' + req.params.userName);
    }
    res.render('masterInfo', { title: req.params.userName, categoryList: categories, layout: 'layout' });
  })
};

/*
exports.modifyInfo = function(req, res){
  res.render('modifyInfo', { title: req.params.userName, layout: 'layout' });
};
*/

exports.addCategory = function(req, res){
  var newCategory = new Category({
    name: req.body.newCateg,
    userName: req.session.user.name,
    num: 0
  });
  //检查类别是否存在
  Category.findOne(newCategory, function(err, category) {
    if (category) {
      err = "该类别已经存在";
    }
    if (err) {
      return res.send('exist');
    }
    //如果存在则新增类别
    newCategory.save(function(err) {
      if (err) {
        return res.send('error');
      }
      return res.send('success');
    });
  });  
};

exports.delCategory = function(req, res){
  var delCategory = new Category({
    name: req.body.name,
    userName: req.session.user.name,
    num: 0
  });
  //检查类别是否存在
  Category.findOne(delCategory, function(err, category) {
    if (!category) {
      err = "该类别不存在";
    }
    if (err) {
      return res.send('donotexist');
    }
    //如果存在则删除类别
    delCategory.del(function(err) {
      if (err) {
        return res.send('error');
      }
      return res.send('success');
    });
  });  
};

exports.renameCategory = function(req, res){
  var oldCategory = new Category({
    name: req.body.name,
    userName: req.session.user.name,
    num: 0
  });
  var newCategory = new Category({
    name: req.body.newName,
    userName: req.session.user.name,
    num: 0
  });
  //检查类别是否存在
  Category.findOne(oldCategory, function(err, category) {
    if (!category) {
      err = "该类别不存在";
    }
    if (err) {
      return res.send('donotexist');
    }
    //检查新类别是否存在
    Category.findOne(newCategory, function(err, category) {
      if (category) {
        err = "该类别已存在";
      }
      if (err) {
        return res.send('exist');
      }
      //如果存在则重命名类别
      oldCategory.rename(newCategory, function(err) {
        if (err) {
          return res.send('error');
        }
        return res.send('success');
      });
    });
  });  
};

exports.categories = function(req, res){
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/masterHome/' + req.params.userName);
    }
    res.render('categories', { title: req.params.userName, categoryList: categories, layout: 'layout' });
  })
  
};

exports.checkLogin = function(req, res, next){
  if (!req.session.user) {
    req.flash('error', '未登陆');
    return res.redirect('/login');
  }
  next();
}

exports.checkNotLogin = function(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登陆');
    return res.redirect('/masterHome/' + req.session.user.name);
  }
  next();
}

exports.checkUser = function(req, res, next) {
  //检查用户是否存在
  User.get(req.params.userName, function(err, user) {
    if (!user) {
      var pathname = url.parse(req.url).pathname;
      if (req.session.user) {
        req.flash('error', pathname + '网页不存在');
        return res.redirect('/masterHome/' + req.session.user.name);
      } else {
        req.flash('error', pathname + '网页不存在，请登陆');
        return res.redirect('/login');
      }
    } else {
      next();
    }
  });
}