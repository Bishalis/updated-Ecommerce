const {Cart}  = require('../model/Cart')

exports.fetchCartByUser= async (req,res)=>{

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    const {id} = req.user;
    try{
    const cartItems = await Cart.find({user:id}).populate('product');
    const transformedItems = cartItems.map(item => ({
        id: item._id.toString(),
        product: item.product._id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
    }));
    res.status(200).json(transformedItems);
    }catch(error){
     res.status(400).json(error);
    }
}


exports.addToCart = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ status: false, message: 'Unauthorized: User not found' });
    }
    const { id } = req.user;
    const { product, quantity } = req.body;

    // Input validation
    if (!product || typeof product !== 'string') {
      return res.status(400).json({ status: false, message: 'Invalid or missing product ID' });
    }
    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 1)) {
      return res.status(400).json({ status: false, message: 'Quantity must be a positive integer' });
    }
    try {
      // Check if product exists in user's cart
      let cartItem = await Cart.findOne({ 
        user: id,
        product: product
      });
  
      if (cartItem) {
        // Update quantity if exists
        cartItem.quantity += quantity || 1;
      } else {
        // Create new cart item
        cartItem = new Cart({
          product: product,
          quantity: quantity || 1,
          user: id
        });
      }
  
      const savedItem = await cartItem.save();
      const populatedItem = await savedItem.populate('product');
      
      // Return properly formatted response
      res.status(200).json({
        id: populatedItem._id,
        product: populatedItem.product._id,
        title: populatedItem.product.title,
        price: populatedItem.product.price,
        quantity: populatedItem.quantity,
        thumbnail: populatedItem.product.thumbnail,
      });
  
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ 
        status: false,
        message: error.message || "Failed to add item to cart"
      });
    }
  }

exports.deleteFromCart = async (req, res) => {
    const {id} = req.params;
    try {
        const doc = await Cart.findByIdAndDelete(id);
        res.status(200).json(doc);
    } catch(error) {
        res.status(400).json(error);
    }
} 


exports.updateCart = async (req, res) => {
    const {id} = req.params;
    try {
        const cart = await Cart.findByIdAndUpdate(id,req.body,{
            new:true
        });
        const result = await cart.populate('product');
        const transformedItem = {
            id: result._id.toString(),
            product: result.product._id,
            title: result.product.title,
            price: result.product.price,
            quantity: result.quantity,
            thumbnail: result.product.thumbnail,
        };
        res.status(201).json(transformedItem);
    } catch(error) {
        res.status(400).json(error);
    }
} 