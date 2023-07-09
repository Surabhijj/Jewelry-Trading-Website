const jewelry = require('../models/jewelry');

exports.isGuest  =(req,res,next)=>{
    if(!req.session.user){
        return next();
    }else{
        req.flash('error', 'you logged in already');
        return res.redirect('/users/profile');
    }
}

exports.isLoggedIn  =(req,res,next)=>{
    if(req.session.user){
        return next();
    }else{
        req.flash('error', 'you need to log in first');
        return res.redirect('/users/login');
    }
}

exports.isCreatedBy=(req,res,next)=>{
    let id = req.params.id;
    jewelry.findById(id)
    .then(jewelry=>{
        if(jewelry){
            if(jewelry.item_created_by == req.session.user){
                return next();

            }else{
                let err =  new Error('Unauthorised to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
    
};
