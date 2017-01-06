const cloudinary = require('cloudinary');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let imageSchema = mongoose.Schema({
    _owner: {type: Schema.Types.ObjectId, ref: 'User'},
    url: String
});



let Image = mongoose.model('Image', imageSchema);
module.exports = Image;