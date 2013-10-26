var mongodb = require('./db');

function Category(category) {
  this.name = category.name;
  this.userName = category.userName;
  this.num = category.num;
}
module.exports = Category;

Category.prototype.save = function save(callback) {
  //存入mongodb的文档
  var category = {
    name: this.name,
    userName: this.userName,
    num: this.num
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取categories集合
    db.collection('categories', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //写入category文档
      collection.insert(category, {safe: true}, function(err, category) {
        mongodb.close();
        callback(err, category);
      });
    });
  });
};

Category.get = function get(userName, callback) {
  mongodb.open(function(err, db){
    if (err) {
      return callback(err);
    }
    //读取categories集合
    db.collection('categories', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //查找userName属性为userName的文档
      var query = {};
      if (userName) {
      	query.userName = userName;
      }
      collection.find(query).sort({num: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }          
        //封装categories为Category对象
        var categories = [];
        docs.forEach(function(doc, index) {
        	var category = new Category(doc);
        	categories.push(category);
        });
        callback(null, categories);
      });
    });
  });
};

Category.findOne = function findOne(category, callback) {
  mongodb.open(function(err, db){
    if (err) {
      return callback(err);
    }
    //读取categories集合
    db.collection('categories', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //查找userName属性为userName的文档
      var query = {};
      if (category.userName && category.name) {
        query.userName = category.userName;
        query.name = category.name;
      }
      collection.findOne(query, function(err, doc) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }          
        if (doc) {
          //封装文档为Category对象
          var curCategory = new Category(doc);
          callback(err, curCategory);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

Category.prototype.del = function del(callback) {
  var name = this.name;
  var userName = this.userName;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取categories集合
    db.collection('categories', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      console.log(name +","+userName);
      //删除category文档
      collection.remove({name:name,userName:userName}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

Category.prototype.rename = function rename(newCategory, callback) {
  var name = this.name;
  var userName = this.userName;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取categories集合
    db.collection('categories', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //修改category文档
      collection.update({name:name,userName:userName},{$set:{name:newCategory.name}}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

Category.prototype.add = function add(callback) {
  var name = this.name;
  var userName = this.userName;
  var num = this.num + 1;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    //读取categories集合
    db.collection('categories', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      //修改category文档
      collection.update({name:name,userName:userName},{$set:{num: num}}, {safe:true}, function(err,result) {
        mongodb.close();
        callback(err);
      });
    });
  });
};