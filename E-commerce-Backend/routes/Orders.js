const express = require('express');
const { createOrder, fetchOrdersByUser, deleteOrder, updateOrder, fetchAllOrders } = require('../controller/Order');
const router = express.Router();
const {checkAuth} = require('../controller/Auth');

router.post('/', checkAuth, createOrder)
    .get('/own/', checkAuth, fetchOrdersByUser)
    .get('/', checkAuth, fetchAllOrders)
    .delete('/:id', checkAuth, deleteOrder)
    .patch('/:id', checkAuth, updateOrder)
  

exports.router = router;