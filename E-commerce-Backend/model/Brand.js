const mongoose = require('mongoose');
const { Schema } = mongoose;


const brandSchema = new Schema({
    value: { type: String, required: true , unique:true},
    label: { type: String, required: true,unique:true },
})


const virtual = brandSchema.virtual('id');
virtual.get(function(){
    return this._id;
})



exports.Brand = mongoose.model('Brand', brandSchema)
