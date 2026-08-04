const express = require('express');
const { createProduct, fetchAllProducts, fetchProductById, updateProduct, deleteProduct } = require('../controller/Product');
const { checkAuth, checkAdmin } = require('../controller/Auth');
const router = express.Router();

router.post('/',checkAuth, checkAdmin, createProduct)
    .get('/', fetchAllProducts)
    .get('/:id', fetchProductById)
    .patch('/:id', checkAuth, checkAdmin, updateProduct)
    .delete('/:id', checkAuth, checkAdmin, deleteProduct)

exports.router = router;