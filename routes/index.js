var url = require("url");
var crypto = require('crypto');//加密并生成各种散列
var fs = require('fs');
var User = require('../models/user.js');
var Category = require('../models/category.js');
var Article = require('../models/article.js');
var Comment = require('../models/comment.js');

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
  res.render('index', { 
    title: req.params.userName 
  });
};

exports.login = function(req, res){
  res.render('login', { 
    title: '登录', 
    layout: 'logLayout' 
  });
};

exports.loginning = function(req, res){
  //生成密码的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.userPwd).digest('base64');

  User.get(req.body.userName, function(err, user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', '用户密码错误');
      return res.redirect('/login');
    }
    req.session.user = user;
    res.redirect('/masterHome/u/' + user.name);
  });
};

exports.logout = function(req, res) {
  req.session.user = null;
  req.flash('success', '退出成功');
  res.redirect('/login');
}

exports.reg = function(req, res){
  res.render('reg', { 
    title: '注册', 
    layout: 'logLayout' 
  });
};

exports.regging = function(req, res){
  //生成密码的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.userPwd).digest('base64');
  
  var newUser = new User({
    name: req.body.userName,
    password: password,
    head: "images/girl.jpg",
    email:req.body.userMail
  });
  
  //检查用户名是否已经存在
  User.get(newUser.name, function(err, user) {
    if(user){
      req.flash('error', '用户已存在');
      return res.redirect('/reg');
    }
    
    //如果不存在则新增用户
    newUser.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      };
      req.session.user = newUser;

      res.redirect('/masterHome/u/' + newUser.name);
    });
  });

};

exports.showArticle = function(req, res){
  getGlobalData(req, res, function(categories, tags, user){
    //获取文章信息
    //var minute = ;
    Article.getOne(req.params.userName, req.params.minute, function(err, article) {
      if(err || (article == null)) {
        req.flash('error', err);
        return res.redirect('/masterHome/u/' + req.params.userName);
      }
      //数据传递给模板视图
      res.render('showArticle', { 
        title: req.params.userName, 
        blogInfo: user, 
        categoryList: categories, 
        tags: tags,
        article:article, 
        layout: 'layout' 
      });
    });
  });
};

exports.delArticle = function (req, res) {
  Article.getOne(req.params.userName, req.body.minute, function(err, article) {
      if(err || !article) {
        return res.send('donotexist');
      }
      //如果存在则删除文章
      Article.remove(req.params.userName, req.body.minute, function(err) {
        if (err) {
          return res.send('error');
        }
        var minusCategory = new Category({
          name: article.category,
          userName: req.params.userName,
          num: 0
        });
        Category.findOne(minusCategory, function(err, category) {
          if(err) {
            return res.send('error');
          }

          if(category.num >1) {
            Category.minus(req.params.userName,article.category, function(err) {
              if (err) {
                return res.send('error');
              }
              return res.send('success');
            });
          } else {
            minusCategory.del(function(err) {
              if (err) {
                return res.send('error');
              }
              return res.send('success');
            });
          }
          
        });
        
      });
    });
};

exports.addComment = function (req, res) {
  var date = new Date(),
      time = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();

  var comment = {
      name: req.body.name,
      head: req.body.head,
      time: time,
      content: req.body.content
  };
  var newComment = new Comment(req.params.userName, req.params.day, req.params.title, comment);
  newComment.save(function (err) {
    if (err) {
      req.flash('error', err); 
    }
    return res.send('success');
  });
};

exports.search = function (req, res) {
  getGlobalData(req, res, function(categories, tags, user){
    //根据关键字获取文章
    Article.search(req.query.keyword, function (err, articles) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('masterHome', {
        title: "SEARCH:" + req.query.keyword,
        blogInfo: user, 
        categoryList: categories,
        tags: tags, 
        articleList: articles, 
        layout: 'layout' 
      });
    });
  });
};

exports.masterHome = function(req, res){
  var page = req.query.p ? parseInt(req.query.p) : 1;
  getGlobalData(req, res, function(categories, tags, user){
    //分页获取文章
    Article.getTen(req.params.userName, page, function(err, articles) {
      if(err) {
        req.flash('error', err);      
        return res.redirect('/login');
      }
      //数据传递给模板视图
      res.render('masterHome', {
        title: req.params.userName, 
        blogInfo: user, 
        categoryList: categories, 
        tags: tags,
        articleList: articles, 
        layout: 'layout' 
      });
    });
  });
};

exports.publishBlog = function(req, res){
  getGlobalData(req, res, function(categories, tags, user){
    //数据传递给模板视图
    res.render('publishBlog', { 
      title: req.params.userName, 
      blogInfo: user, 
      categoryList: categories, 
      tags: tags,
      layout: 'layout' 
    });
  });
};

exports.addBlog = function(req, res){
  var now = new Date();
  var abstract = req.body.newBlogContent.replace(/<\/?[^>]*>/g,'');
  if(abstract.length >220) {
    abstract = abstract.slice(0,200);
  }
  var newBlog = new Article(
    req.params.userName,
    req.body.newBlogHead,
    req.body.newBlogContent,
    abstract,
    req.body.newBlogTags,
    req.body.newBlogCategory
  );
  newBlog.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/publishBlog/u/' + req.params.userName);
    };
    User.get(req.params.userName, function(err, user) {
        if(err){
          req.flash('error', err);
          return res.redirect('/login');
        }
       res.redirect('/showArticle/u/' + req.params.userName + '/' + now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "%20" + now.getHours() + ":" + now.getMinutes());
    });
  }); 
};

exports.masterStore = function(req, res){
  getGlobalData(req, res, function(categories, tags, user){
    //数据传递给模板视图
    res.render('masterStore', { 
      title: req.params.userName, 
      blogInfo: user, 
      categoryList: categories, 
      tags: tags,
      layout: 'layout' 
    });
  });
};

exports.masterMessage = function(req, res){
  getGlobalData(req, res, function(categories, tags, user){
    //数据传递给模板视图
    res.render('masterMessage', { 
      title: req.params.userName, 
      blogInfo: user, 
      categoryList: categories,
      tags: tags, 
      layout: 'layout' 
    });
  });
};

exports.masterInfo = function(req, res){
  getGlobalData(req, res, function(categories, tags, user){
    //数据传递给模板视图
    res.render('masterInfo', { 
      title: req.params.userName, 
      blogInfo: user, 
      categoryList: categories, 
      tags: tags,
      layout: 'layout' 
    });
  });
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
  getGlobalData(req, res, function(categories, tags, user){
    //数据传递给模板视图
    res.render('categories', { 
      title: req.params.userName, 
      blogInfo: user, 
      categoryList: categories, 
      tags: tags,
      layout: 'layout' 
    });
  });
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
    return res.redirect('/masterHome/u/' + req.session.user.name);
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
        return res.redirect('/masterHome/u/' + req.session.user.name);
      } else {
        req.flash('error', pathname + '网页不存在，请登陆');
        return res.redirect('/login');
      }
    } else {
      next();
    }
  });
}

/**********************************************************/
//获取模板页面所需公共数据
var getGlobalData = function(req, res, Func) {
  //获取文章分类
  Category.get(req.params.userName, function(err, categories) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/masterHome/u/' + req.params.userName);
    }
    //获取标签
    Article.getTags(req.params.userName, function(err, articleTags) {
      if(err){
        req.flash('error', err);
        return res.redirect('/login');
      }
      var tags = getUniqueTags(articleTags);
      //获取博主信息
      User.get(req.params.userName, function(err, user) {
        if(err){
          req.flash('error', err);
          return res.redirect('/login');
        }       
        Func(categories, tags, user);
      });
    });
  });
}

/**********************************************************/
//去掉标签中的重复标签
//标签数组中每个元素都是字符串，标签以逗号隔开

var getUniqueTags = function(articleTags){
  var tags = [];
  articleTags.forEach(function(articleTag, index) {
    if(articleTag){
      tags = tags.concat(articleTag.tags.split(','));
    }
  });
  if(tags) {
    tags = tags.unique();
  }
  return tags;
}

/**********************************************************/
//数组去掉重复项
Array.prototype.unique = function() {
  var res = [], hash = {};
  for(var i=0, elem; (elem = this[i]) != null; i++)  {
    if (!hash[elem])
    {
      res.push(elem);
      hash[elem] = true;
    }
  }
  return res;
}

/***********************************************************/
