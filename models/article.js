var mongodb = require('./db');
var Category = require('../models/category.js');


function Article(name, title, content, abstract, tags, category) {
  this.name = name;
  this.title = title;
  this.content = content;
  this.abstract = abstract;
  this.tags = tags;
  this.category = category;
}
module.exports = Article;


//存储一篇文章及其相关信息
Article.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth()+1),
      day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
  }
  //要存入数据库的文档
  var article = {
      name: this.name,
      time: time,
      title:this.title,
      tags: this.tags,
      content: this.content,
      abstract: this.abstract,
      category: this.category,
      viewNum: 0,
      comments: []
      
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 articles 集合
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //将文档插入 articles 集合
      collection.insert(article, {
        safe: true
      }, function (err, result) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        var newCategory = new Category({
          name: article.category,
          userName: article.name,
          num: 1
        });
        //检查类别是否存在
        //读取categories集合
        db.collection('categories', function(err, categories) {
          
          //查找userName属性为userName的文档
          var query = {};
          if (newCategory.name) {
            query.userName = newCategory.userName;
            query.name = newCategory.name;
          
            categories.findOne(query, function(err, doc) {
              if (err) {
                callback(err, null);
              }         
              
              if (doc) {
                //封装文档为Category对象
                var curCategory = new Category(doc);
                //修改category文档
                categories.update({name:newCategory.name,userName:newCategory.userName},{$set:{num: curCategory.num + 1}}, {safe:true}, function(err,result) {
                  mongodb.close();
                  callback(err);
                });
                
              } else {
                //写入category文档
                categories.insert(newCategory, {safe: true}, function(err, category) {
                  mongodb.close();
                  callback(err);
                });
              }
            });
          }
        });
      });
    });
  });
};

//一次获取十篇文章
Article.getTen = function(name, page, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 Articles 集合
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //使用 count 返回特定查询的文档数 total
      collection.count(query, function (err, total) {
        //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
        collection.find(query, {
          skip: (page - 1)*10,
          limit: 10
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          mongodb.close();
          if (err) {
            return callback(err);
          }

          docs.forEach(function(doc) {
            delete doc.content;
          });
          callback(null, docs, total);
        });
      });
    });
  });
};

//获取一篇文章
Article.getOne = function(name, minute, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 articles 集合
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "name": name,
        "time.minute": minute
      }, function (err, doc) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        // //解析 markdown 为 html
        // if(doc){
        //   doc.content = markdown.toHTML(doc.content);
        //   doc.comments.forEach(function (comment) {
        //     comment.content = markdown.toHTML(comment.content);
        //   });
        // }
        callback(null, doc);//返回查询的一篇文章
      });
      //每访问 1 次，viewNum 值增加 1
      collection.update({
        "name": name,
        "time.minute": minute,
      }, {
        $inc: {"viewNum": 1}
      });
    });
  });
};

// //返回原始发表的内容（markdown 格式）
// Article.edit = function(name, day, title, callback) {
//   //打开数据库
//   mongodb.open(function (err, db) {
//     if (err) {
//       return callback(err);
//     }
//     //读取 articles 集合
//     db.collection('articles', function (err, collection) {
//       if (err) {
//         mongodb.close();
//         return callback(err);
//       }
//       //根据用户名、发表日期及文章名进行查询
//       collection.findOne({
//         "name": name,
//         "time.day": day,
//         "title": title
//       }, function (err, doc) {
//         mongodb.close();
//         if (err) {
//           return callback(err);
//         }
//         callback(null, doc);//返回查询的一篇文章（markdown 格式）
//       });
//     });
//   });
// };

//更新一篇文章及其相关信息
Article.update = function(name, day, title, content, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 articles 集合
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //更新文章内容
      collection.update({
        "name": name,
        "time.day": day,
        "title": title
      },{
        $set: {content: content}
      }, function (err, result) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

//删除一篇文章
Article.remove = function(name, minute, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 articles 集合
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //根据用户名、日期和标题查找并删除一篇文章
      collection.remove({
        "name": name,
        "time.minute": minute
      }, function (err, result) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

//返回所有文章存档信息
Article.getArchive = function(callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 articles 集合
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({}, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//返回所有标签
Article.getTags = function(userName, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 articles 集合
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //distinct 用来找出给定键的所有不同值
      collection.find({"name":userName},{tags: 1}).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//返回含有特定标签的所有文章
Article.getTag = function(tag, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //通过 tags.tag 查询并返回只含有 name、time、title 键的文档组成的数组
      collection.find({
        "tags.tag": tag
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//返回通过标题关键字查询的所有文章
Article.search = function(keyword, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var pattern = new RegExp("^.*" + keyword + ".*$", "i");
      collection.find({
        "title": pattern
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};


