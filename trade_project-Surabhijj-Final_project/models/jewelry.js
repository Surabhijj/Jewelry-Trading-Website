const mongoose = require('mongoose');
const schema = mongoose.Schema;

const jewelrySchema = new schema({
    item_category:{type:String, required: [true,'item_category is required']},
    item_name:{type:String, required: [true,'item_name is required']},
    item_details:{type:Array, required:[true,'item_details is required']},
    item_image:{type:String, required: [true]},
    item_status:{type:String, required: [true]},
    item_created_by:{type:schema.Types.ObjectId, ref:"User"}
},
{timestamps:true}
);

module.exports = mongoose.model('Product', jewelrySchema);

