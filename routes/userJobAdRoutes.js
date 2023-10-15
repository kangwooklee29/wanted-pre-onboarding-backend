const express = require('express');
const router = express.Router();
const userJobAdController = require('../controllers/userJobAdController');

router.post('/', userJobAdController.postUserJobAd);

module.exports = router;
