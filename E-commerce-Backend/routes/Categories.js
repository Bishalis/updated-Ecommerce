const express = require('express');
const { fetchCategory, createCategory } = require('../controller/Category');
const router = express.Router();
//categories is already added in base path
router.get('/', fetchCategory).post('/',createCategory)

exports.router = router;