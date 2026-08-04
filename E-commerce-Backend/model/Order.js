const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
     product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
     quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema({
    items:{type:[orderItemSchema],required:true},
   totalAmount: { type: Number},
   totalItems: { type: Number},
   user: { type: Schema.Types.ObjectId,ref:'User', required: true },
   paymentMethod:{type:String , required:true},
   status:{type:String,default:'pending'},
    selectedAddresses:{
        type: {
            name: String,
            email: String,
            city: String,
            state: String,
            pinCode: String,
            street: String,
            phone: String,
        },
        required:true
    },
    paymentStatus:{type:String, default:"pending"}
})


const virtual = orderSchema.virtual('id');
virtual.get(function(){
    return this._id;
})



orderSchema.set('toJSON',{
    virtuals:true,
    versionKey:false,
    transform:function(doc,ret){delete ret._id}
})

exports.Order = mongoose.model('Order', orderSchema)
