var mongodb = require('./db');
var Category = require('../models/category.js');
var markdown = require('markdown').markdown;

function Article(article) {
  this.id = article.id;
  this.author = article.author;
  this.head = article.head;
  this.content = article.content;
  this.publishTime = article.publishTime;
  this.tags = article.tags;
  this.commentNum = article.commentNum;
  this.likeNum = article.likeNum;
  this.category = article.category;
}
module.exports = Article;

Article.prototype.save = function save(callback) {
  var date = new Date();
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth()+1),
      day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
  }
  //存入mongodb的文档
  var newArticle = {
    id: this.id,
    author: this.author,
    head: this.head,
    content: this.content,
    publishTime: time,
    tags: this.tags,
    commentNum: this.commentNum,
    likeNum: this.likeNum,
    category: this.category
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取articles集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //为id属性添加索引
      collection.ensureIndex('id', {unique: true});
      //写入article文档
      collection.insert(newArticle, {safe: true}, function(err) {
        var newCategory = new Category({
          name: newArticle.category,
          userName: newArticle.author,
          num: 1
        });
        //检查类别是否存在
        //读取categories集合
        db.collection('categories', function(err, categories) {
          if (err) {
            mongodb.close();
            return callback(err);
          }
          //查找userName属性为userName的文档
          var query = {};
          if (newCategory.userName && newCategory.name) {
            query.userName = newCategory.userName;
            query.name = newCategory.name;
          }
          categories.findOne(query, function(err, doc) {
            if (err) {
              callback(err, null);
            }          
            if (doc) {
              //封装文档为Category对象
              var curCategory = new Category(doc);
              //修改category文档
              categories.update({name:curCategory.name,userName:curCategory.userName},{$set:{num: curCategory.num + 1}}, {safe:true}, function(err,result) {
                mongodb.close();
                callback(err);
              });
              
            } else {
              //为name属性添加索引
              categories.ensureIndex('name', {unique: true});
              //写入category文档
              
              categories.insert(newCategory, {safe: true}, function(err, category) {
                mongodb.close();
                callback(err);
              });
            }
          });
        });
        
      });
    });
  });
};

Article.get = function get(author, callback) {
  mongodb.open(function(err, db){
    if (err) {
      return callback(err);
    }
    //读取articles集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //查找author属性为author的文档
      var query = {};
      if (author) {
      	query.author = author;
      }
      collection.find(query).sort({publishTime: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }          
        //封装articles为Article对象
        var articles = [];
        docs.forEach(function(doc, index) {
        	var article = new Article(doc);
        	articles.push(article);
          //doc.content = markdown.toHTML(doc.content);
        });
        callback(null, articles);
      });
    });
  });
};

Article.getOne = function getOne(author, articleId, callback) {
  mongodb.open(function(err, db){
    if (err) {
      return callback(err);
    }
    //读取articles集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //查找文档
      collection.findOne({author:author,id:parseInt(articleId)}, function(err, doc) {
        mongodb.close();
        if (doc) {
          //封装文档为article对象
          var article = new Article(doc);
          //doc.content = markdown.toHTML(doc.content);
          callback(err, article);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

Article.getMaxId = function getMaxId(callback) {
  mongodb.open(function(err, db){
    if (err) {
      return callback(err);
    }
    //读取articles集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //查询最大id
      collection.find().sort({"id" : -1}).limit(1).toArray(function(err, doc) {
        mongodb.close();
        console.log(doc.article);
        if (doc) {
          if(doc.length > 0) {
            
            //封装文档为article对象
            var article = new Article(doc[0]);
            callback(err, article.id);
          } else {
            callback(err, 0);
          }
        } else {
          callback(err, null);
        }
      });
      
    });
  });
};

Article.prototype.del = function del(callback) {
  var id = this.id;
  var author = this.author;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取articles集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //删除article文档
      collection.remove({id:id,author:author}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

Article.prototype.update = function update(newArticle, callback) {
  var id = this.id;
  var author = this.author;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取article集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //修改article文档
      collection.update({id:id,author:author},{$set:{head:newArticle.head,content:newArticle.content,tags:newArticle.tags}}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

Article.prototype.addComment = function addComment(callback) {
  var id = this.id;
  var author = this.author;
  var commentNum = this.commentNum + 1;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取article集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //修改article文档
      collection.update({id:id,author:author},{$set:{commentNum: commentNum}}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

Article.prototype.addlike = function addlike(callback) {
  var id = this.id;
  var author = this.author;
  var likeNum = this.likeNum + 1;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取article集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //修改article文档
      collection.update({id:id,author:author},{$set:{likeNum: likeNum}}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

Article.prototype.modifyCategory = function modifyCategory(newCategory,callback) {
  var id = this.id;
  var author = this.author;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取article集合
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //修改article文档
      collection.update({id:id,author:author},{$set:{category: newCategory}}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

