const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const watchSchema = new Schema({
    user_id : {type: Schema.Types.ObjectId, ref:'User'},
    trade_item_id :{type: Schema.Types.ObjectId, ref:'Product'}
});

module.exports = mongoose.model('WatchList', watchSchema);