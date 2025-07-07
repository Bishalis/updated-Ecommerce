const { Order } = require("../model/Order");
const { Product } = require("../model/Product");


exports.createOrder = async (req, res) => {
    try {
        console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
        const order = new Order(req.body)
        
        // Update product stock for each item
        for(let item of order.items){
            let product = await Product.findOne({_id: item.product})
            
            if (!product) {
                return res.status(400).json({ 
                    error: `Product with id ${item.product} not found` 
                });
            }
            
            // Check if enough stock is available
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for product ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}` 
                });
            }
            
            // Update stock
            product.stock -= item.quantity;
            await product.save();
        }
        
        const doc = await order.save();
        console.log('Order saved successfully:', JSON.stringify(doc, null, 2));
        res.status(201).json(doc);
    } catch(err) {
        console.error('Error creating order:', err);
        res.status(400).json({ error: err.message });
    }
} 

exports.fetchOrdersByUser= async (req,res)=>{
    const {id} = req.user;
    try{
    const order = await Order.find({user:id});
    res.status(200).json(order);
    }catch(err){
     res.status(400).json(err);
    }
}




exports.deleteOrder = async (req, res) => {
    const {id} = req.params;
    try {
        const order = await Order.findByIdAndDelete(id);
        res.status(200).json(order);
    } catch(err) {
        res.status(400).json(err);
    }
} 


exports.updateOrder = async (req, res) => {
    const {id} = req.params;
    try {
        const order = await Order.findByIdAndUpdate(id,req.body,{
            new:true
        });
        res.status(201).json(order);
    } catch(err) {
        res.status(400).json(err);
    }
} 

exports.fetchAllOrders = async (req, res) => {
    try {
        // here we need all query string
        let query = Order.find({})
        let totalOrdersQuery = Order.find({deleted:{$ne:true}});

        if (req.query._sort && req.query._order) {
            query = query.sort({ [req.query._sort]: req.query._order })
        }

        const totalDocs = await totalOrdersQuery.count().exec();
        console.log('Total orders:', totalDocs);

        if (req.query._page && req.query._limit) {
            const pageSize = req.query._limit;
            const page = req.query._page
            query = query.skip(pageSize * (page - 1)).limit(pageSize)
        }

        const doc = await query.exec();
        res.set('X-Total-Count', totalDocs);
        res.status(200).json(doc);
    } catch (err) {
        console.error('Error fetching all orders:', err);
        res.status(400).json(err);
    }
} 