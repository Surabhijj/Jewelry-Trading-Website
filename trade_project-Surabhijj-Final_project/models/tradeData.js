const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tradeDataSchema = new Schema({
    user_id : {type: Schema.Types.ObjectId, ref:'User'},
    item_toTrade_id :{type: Schema.Types.ObjectId, ref:'Product'},
    item_tradedWith_id: {type: Schema.Types.ObjectId, ref:'Product'},
    item_tradedWith_userId: {type: Schema.Types.ObjectId, ref:'User'},
    item_status:{type:String, required: [true]},
});

module.exports = mongoose.model('tradeData', tradeDataSchema);