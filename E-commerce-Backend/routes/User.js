const express = require('express');
const { fetchUserById, updateUser } = require('../controller/User');
const { checkAuth } = require('../controller/Auth');
const router = express.Router();

router .get('/own', checkAuth , fetchUserById)
    .patch('/:id', updateUser)

exports.router = router;