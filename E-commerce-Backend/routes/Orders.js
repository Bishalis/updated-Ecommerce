const express = require('express');
const { createOrder, fetchOrdersByUser, deleteOrder, updateOrder, fetchAllOrders } = require('../controller/Order');
const router = express.Router();
const {checkAuth, checkAdmin} = require('../controller/Auth');

router.post('/', checkAuth, createOrder)
    .get('/own/', checkAuth, fetchOrdersByUser)
    .get('/', checkAuth, checkAdmin, fetchAllOrders)
    .delete('/:id', checkAuth, checkAdmin, deleteOrder)
    .patch('/:id', checkAuth, checkAdmin, updateOrder)
  

exports.router = router;