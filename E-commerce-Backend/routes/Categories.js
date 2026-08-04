const express = require('express');
const { fetchCategory, createCategory } = require('../controller/Category');
const { checkAuth, checkAdmin } = require('../controller/Auth');
const router = express.Router();
//categories is already added in base path
router.get('/', fetchCategory).post('/', checkAuth, checkAdmin, createCategory)

exports.router = router;