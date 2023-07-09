const model = require('../models/user')
const jewelry = require('../models/jewelry');
const watchData = require('../models/watchData');
const tradeData = require('../models/tradeData');


exports.new = (req, res) => {
  res.render("./user/new");
};
// new user creation
exports.create = (req, res, next) => {
  let user = new model(req.body);
  if(user.email)
      user.email = user.email.toLowerCase();
  user.save()
    .then(() => res.redirect("/users/login"))
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("users/new");
      }
      if (err.code === 11000) {
        req.flash("error", "Email address has already been used");
        return res.redirect("/users/new");
      }
      next(err);
    });
};

exports.login = (req, res) => {
  res.render("./user/login");
};
// authentication feature
exports.authenticate = (req, res, next) => {
  //authentic user`s login request
  let email = req.body.email;
  if(email)
      email = email.toLowerCase();
  let password = req.body.password;

  //get the user that matches the email
  model
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        //user found in the database
        user.comparePassword(password).then((result) => {
          if (result) {
            req.session.user = user._id;
            req.flash("success", "You have successfully logged in");
            res.redirect("/users/profile");
          } else {
            req.flash("error", "wrong password!");
            res.redirect("/users/login");
          }
        });
      } else {
        req.flash("error", "Wrong email address!");
        res.redirect("/users/login");
      }
    })
    .catch((err) => next(err));
};
//user profile details
exports.profile = (req, res, next) => {
  let id = req.session.user;
  Promise.all([model.findById(id), jewelry.find({item_created_by: id})])
  .then(results=>{
    const [user, jewels]= results;
    watchData.find({user_id : id}).populate('trade_item_id','item_category item_name item_status')
    .then(watchListData => {
        tradeData.find({
          "$or": [{
          "user_id" :  id 
        },{ "item_tradedWith_userId" :  id
          }]
      }).populate('item_toTrade_id','item_category item_name item_status item_created_by')
        .then(tradeData=>{
          res.render('./user/profile', {id,user, jewels, results,watchListData,tradeData});
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
    }) 
    .catch((err) => next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };
