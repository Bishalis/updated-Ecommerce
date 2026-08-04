const express = require('express');
const { fetchBrands, createBrand } = require('../controller/Brand');
const { checkAuth, checkAdmin } = require('../controller/Auth');
const router = express.Router();

router.get('/', fetchBrands).post('/', checkAuth, checkAdmin, createBrand)

exports.router = router;