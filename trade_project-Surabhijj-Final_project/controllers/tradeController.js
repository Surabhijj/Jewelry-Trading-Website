const jewelry = require('../models/jewelry');
const model = require('../models/jewelry');
const watchData = require('../models/watchData');
const TradeDetails = require('../models/tradeData'); 


exports.index = (req,res, next)=>{
    model.find()
    .then(jewelry=>{
        const groupBy = key => array =>
        array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
        }, {});
    
        const groupByCategory = groupBy('item_category');
        const temp = JSON.stringify({
            itemsByCategory: groupByCategory(jewelry),
          }, null, 2);
        res.render('./jewelry/trades',{temp});
    })
    .catch(err=>next(err));
};

    

exports.newTrade = (req,res)=>{
    res.render('./jewelry/newTrade');
};

exports.getJewelryById = (req,res,next)=>{
    let id =req.params.id;
    let u_id = req.session.user;
        model.findById(id)
        .then(jewelry=>{
            if(jewelry){
                watchData.findOne({user_id : u_id,trade_item_id: id})
                .then(watchListData=>{
                    res.render('./jewelry/trade',{jewelry, watchListData});
                })
                .catch(err=>next(err));
            }else{
                let err = new Error('Cannot find a item with id : '+id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=>next(err));
    
};

exports.newTradeData = (req,res,next)=>{
    //res.send('created a new trade');
    let trade = new model(req.body);
    trade.item_image = 'default_image.png';
    trade.item_status = '1';
    trade.item_created_by = req.session.user;

    trade.save()
    .then((trade)=>{
        res.redirect('/trades');

    })
    .catch(err=>{
       if(err.name === 'validationError' ){
            err.status = 400;
       }
       next(err);

    });

};


exports.editById = (req,res,next)=>{
    let id = req.params.id;
        model.findById(id)
        .then(jewelry=>{
            if(jewelry){
                return res.render('./jewelry/edit_trade',{jewelry});
            }else{
                let err = new Error('Cannot find a item with id : '+id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=>next(err));
    
};

exports.updateJewelryDetails = (req, res,next)=>{
    let jewelry = req.body;
    let id = req.params.id;

        model.findByIdAndUpdate(id, jewelry ,{useFindAndModify:false, runValidators:true})
        .then(jewelry=>{
            if(jewelry){
                res.redirect('/trades/' +id);
            }else{
                let err = new Error('Cannot find a item with id : '+id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=>{
            if(err.name ==='ValidationError')
                err.status = 400;
            next(err)
        });
    
    
    
    // console.log(trade);
    // res.send('update tradejewelry with id'+req.params.id);
};

exports.DeleteById = (req,res,next)=>{
    //res.send('deleted id '+ req.params.id);
    let id = req.params.id;
         model.findByIdAndDelete(id,{useFindAndModify:false})
        .then(jewelry=>{
            if(jewelry){
                watchData.deleteMany({trade_item_id : id})
                .then(data=>{
                    TradeDetails.find({
                        "$or": [{
                         "item_toTrade_id" :  id 
                      },{ "item_tradedWith_id" :  id
                        }]
                     })
                     .then(val => {
                        console.log(val[0]);
                        var updateId;
                        if(val[0].item_tradedWith_id == id){
                            updateId = val[0].item_toTrade_id;
                        }else if(val[0].item_toTrade_id == id){
                            updateId = val[0].item_tradedWith_id;
                        }
    
                        TradeDetails.findByIdAndDelete(val[0]._id)
                        .then(() => {
                            model.updateOne({_id : updateId},{$set: {"item_status" : 1}})
                            .then(() => res.redirect('/trades'))
                            .catch(err=>next(err));
                        })
                        .catch(err => next(err));
      
    
                     })
                     .catch(err => next(err));
    
                })
                .catch(err => next(err));
                
            }else{
                let err = new Error('Cannot delete the product with id '+id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
    
};

exports.addToWatchList = (req, res, next)=>{
    let id = req.params.id;
    let trade = new watchData();
    trade.user_id = req.session.user;
    trade.trade_item_id = id;

    trade.save()
    .then((data)=>{
        req.flash('success', 'Trade Item added to the Watch List');
        res.redirect('/users/profile');

    })
    .catch(err=>{
       if(err.name === 'validationError' ){
            err.status = 400;
       }
       next(err);

    });

}

exports.removeFromWatchList = (req, res,next)=>{
    let id = req.params.id;
    watchData.deleteOne({_id : id})
    .then(()=>{
        req.flash('error', 'Trade Item Removed from the Watch List');
        res.redirect('/users/profile');
    })
    .catch(err=>next(err));
}

exports.selectFromTadeList = (req, res, next) => {
    let id = req.session.user;
    Promise.all([model.findById(id), jewelry.find({item_created_by: id ,item_status:"1"})])
    .then(results=>{
      jewelry_id = req.params.id;
      jewelry_createdByUser = req.body.itemCreatedBy;

      const [user, jewels]= results;
      res.render('./jewelry/selectTradeItem', {user, jewels, jewelry_id, jewelry_createdByUser});

      }) 
      .catch((err) => next(err));
  };

  exports.saveTradeDetails = (req,res,next)=>{
    let tradeDetails = new TradeDetails(req.body);
    tradeDetails.user_id = req.session.user;
    tradeDetails.item_status = " 2";

    tradeDetails.save()
    .then((data)=>{
        model.updateMany({_id:tradeDetails.item_toTrade_id},{$set: {item_status:"2"}})
        .then(e=>{
            model.findOneAndUpdate({_id:tradeDetails.item_tradedWith_id},{$set: {item_status:"2"}})
            .then(e=>{
                req.flash('success', 'Trade Offer has been sent');
                res.redirect('/users/profile');

            })
            .catch(err=>next(err));

        })
        .catch(err=>next(err));

        
    })
    .catch(err=>{
       if(err.name === 'validationError' ){
            err.status = 400;
       }
       next(err);

    });
  
  }

  exports.manageTrade = (req,res,next)=>{
    let id = req.params.id;
    current_user = req.session.user;
    let tradeDetails = new TradeDetails(req.body);

    TradeDetails.findById(id)
    .populate('item_toTrade_id','item_category item_name item_image item_created_by')
    .populate('item_tradedWith_id','item_category item_name item_image item_created_by')
    .then(trades=> {
    
                res.render('./jewelry/manageTrade',{trades,current_user});

            })
            
        
    .catch( err => next(err));
  }

  exports.deleteOffer =(req,res,next)=>{
    let tradesId = req.params.id;
    let currentUser = req.session.user;
    TradeDetails.findByIdAndDelete({_id : tradesId})
    .then(val=>{
        if(val){

        model.updateMany(
            {
              _id: {
                $in: [val.item_toTrade_id, val.item_tradedWith_id]
              }
            },
            {
              $set: {
                item_status: "1"
              }
            }
          )
          .then(()=>{
            req.flash('success','Trade Offer Deleted Successfully');
            res.redirect('/users/profile');

          })
          .catch(err => next(err));
        }else{
          let err = new Error("Cannot cancel the offer");
          err.status = 404;
          next(err);
        }
      })
      .catch(err => next(err));
    


  };
  exports.acceptTrade = (req,res,next)=>{
    let tradesId = req.params.id;
    let currentUser = req.session.user;
    console.log("suuura"+tradesId);

    TradeDetails.findByIdAndUpdate({_id : tradesId},{$set: {item_status:"3"}})
    .then(val=>{
        if(val){

        model.updateMany(
            {
              _id: {
                $in: [val.item_toTrade_id, val.item_tradedWith_id]
              }
            },
            {
              $set: {
                item_status: "3"
              }
            }
          )
          .then(()=>{
            req.flash('success','Trade Offer Deleted Successfully');
            res.redirect('/users/profile');

          })
          .catch(err => next(err));
        }else{
          let err = new Error("Cannot cancel the offer");
          err.status = 404;
          next(err);
        }
      })
      .catch(err => next(err));

  }
