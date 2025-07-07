const express = require('express');
const { addToCart, fetchCartByUser, updateCart, deleteFromCart } = require('../controller/Cart');
const router = express.Router();
const {checkAuth} = require('../controller/Auth');

router.post('/', checkAuth, addToCart)
    .get('/',checkAuth, fetchCartByUser)
    .delete('/:id', checkAuth,deleteFromCart)
    .patch('/:id',checkAuth, updateCart)
  

exports.router = router;

// checkAuth,