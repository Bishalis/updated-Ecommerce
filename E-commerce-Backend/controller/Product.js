const { Product } = require("../model/Product")
const ALLOWED_PRODUCT_SORT_FIELDS = ["price", "rating", "stock", "createdAt", "title"];

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

exports.createProduct = async (req, res) => {
    //to get the product from api
    const product = new Product(req.body)
    try {
        const doc = await product.save();
        res.status(201).json(doc);
    } catch(err) {
        res.status(400).json(err);
    }
} 


exports.fetchAllProducts = async (req, res) => {
  
  const condition = { deleted: { $ne: true } };
    
    let query = Product.find(condition);
    let totalProductsQuery = Product.find(condition);
  

  
    if (req.query.category) {
      query = query.find({ category: {$in:req.query.category.split(',')} });
      totalProductsQuery = totalProductsQuery.find({
        category: {$in:req.query.category.split(',')},
      });
    }
    if (req.query.brand) {
      query = query.find({ brand: {$in:req.query.brand.split(',')} });
      totalProductsQuery = totalProductsQuery.find({ brand: {$in:req.query.brand.split(',') }});
    }
    if (req.query._sort && req.query._order) {
      if (ALLOWED_PRODUCT_SORT_FIELDS.includes(req.query._sort)) {
        const order = String(req.query._order).toLowerCase() === "desc" ? -1 : 1;
        query = query.sort({ [req.query._sort]: order });
      }
    }
  
    const totalDocs = await totalProductsQuery.count().exec();
  
    if (req.query._page && req.query._limit) {
      const pageSize = Math.min(parsePositiveInt(req.query._limit, 10), 100);
      const page = parsePositiveInt(req.query._page, 1);
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
  
    try {
      const docs = await query.exec();
      res.set('X-Total-Count', totalDocs);
      res.status(200).json(docs);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  

exports.fetchProductById = async (req,res)=>{
    const {id} = req.params;
    try {
        const product = await Product.findById(id)
        res.status(200).json(product);
    } catch(err) {
        res.status(400).json(err);
    }
}

exports.updateProduct = async (req,res)=>{
    const {id} = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id,req.body,{new:true});
        res.status(200).json(product);
    } catch(err) {
        res.status(400).json(err);
    }
}

exports.deleteProduct = async (req,res)=>{
    const {id} = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        res.status(200).json({message: "Product deleted successfully"});
    } catch(err) {
        res.status(400).json(err);
    }
}

