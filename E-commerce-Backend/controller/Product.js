const { Product } = require("../model/Product")
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
  
    let condition = {}
    if(!req.query.admin){
        condition.deleted = {$ne:true}
    }
    
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
      query = query.sort({ [req.query._sort] : req.query._order });
    }
  
    const totalDocs = await totalProductsQuery.count().exec();
  
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
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
    console.log(id)
    try {
        const product = await Product.findById(id)
        res.status(200).json(product);
    } catch(err) {
        res.status(400).json(err);
    }
}

exports.updateProduct = async (req,res)=>{
    const {id} = req.params;
    console.log('Backend: Update request received for product ID:', id);
    console.log('Backend: Update data:', req.body);
    try {
        const product = await Product.findByIdAndUpdate(id,req.body,{new:true});
        console.log('Backend: Product updated successfully:', product);
        res.status(200).json(product);
    } catch(err) {
        console.error('Backend: Error updating product:', err);
        res.status(400).json(err);
    }
}

exports.deleteProduct = async (req,res)=>{
    const {id} = req.params;
    console.log('Backend: Delete request received for product ID:', id);
    try {
        const product = await Product.findByIdAndDelete(id);
        console.log('Backend: Product deleted successfully:', product);
        res.status(200).json({message: "Product deleted successfully"});
    } catch(err) {
        console.error('Backend: Error deleting product:', err);
        res.status(400).json(err);
    }
}

