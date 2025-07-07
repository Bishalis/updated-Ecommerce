const mongoose = require('mongoose');
const { Schema } = mongoose;


const productSchema = new Schema({
    title: { type: String, required: true , unique:true},
    description: { type: String},
    price: { type: Number, min: [1, 'wrong min price'], max: [10000, 'wrong max price'], required : true},
    discountPercentage: { type: Number, min: [1, 'wrong min discount'], max: [100, 'wrong max price'] },
    stock: { type: Number, min: [0, 'wrong min stock'], default: 0 },
    rating: { type: Number, min: [0, 'wrong min rating'], max: [5, 'wrong max rating'], default: 0 },
    category: { type:String, required: true },
    brand :{type:String,required:true},
    thumbnail: { type: String, required: true },
    images: { type: [String], required: true },
    deleted: { type: Boolean, default: false },
})


const virtual = productSchema.virtual('id');
virtual.get(function(){
    return this._id;
})




exports.Product = mongoose.model('Product', productSchema)
