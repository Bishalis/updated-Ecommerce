const { Order } = require("../model/Order");
const { Product } = require("../model/Product");
const mongoose = require("mongoose");

const ORDER_SORT_FIELDS = ["createdAt", "totalAmount", "status", "paymentStatus"];

function parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
}


exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { items, totalAmount, totalItems, paymentMethod, selectedAddresses } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Order items are required" });
        }

        session.startTransaction();

        for (const item of items) {
            if (!item.product || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ error: "Each order item must include product and positive integer quantity" });
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true, session }
            );

            if (!updatedProduct) {
                await session.abortTransaction();
                return res.status(400).json({ error: `Insufficient stock or invalid product: ${item.product}` });
            }
        }

        const [doc] = await Order.create(
            [{
                items,
                totalAmount,
                totalItems,
                paymentMethod,
                selectedAddresses,
                user: req.user.id,
            }],
            { session }
        );

        await session.commitTransaction();
        res.status(201).json(doc);
    } catch(err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message || "Failed to create order" });
    } finally {
        session.endSession();
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
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
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
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(201).json(order);
    } catch(err) {
        res.status(400).json(err);
    }
} 

exports.fetchAllOrders = async (req, res) => {
    try {
        let query = Order.find({})
        let totalOrdersQuery = Order.find({});

        if (req.query._sort && req.query._order) {
            if (ORDER_SORT_FIELDS.includes(req.query._sort)) {
                const order = String(req.query._order).toLowerCase() === "desc" ? -1 : 1;
                query = query.sort({ [req.query._sort]: order });
            }
        }

        const totalDocs = await totalOrdersQuery.count().exec();

        if (req.query._page && req.query._limit) {
            const pageSize = Math.min(parsePositiveInt(req.query._limit, 10), 100);
            const page = parsePositiveInt(req.query._page, 1);
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