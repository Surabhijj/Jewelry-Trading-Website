const model = require('../models/jewelry')
exports.about = (req,res)=>{
    let jewelry = model.find();
    res.render('./about',{jewelry});
};

exports.contact = (req,res)=>{
    let jewelry = model.find();
    res.render('./contact',{jewelry});
};

