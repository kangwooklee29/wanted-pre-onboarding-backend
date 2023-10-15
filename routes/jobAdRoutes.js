const express = require('express');
const router = express.Router();
const jobAdController = require('../controllers/jobAdController');

router.get('/', jobAdController.getAllJobAds);
router.post('/', jobAdController.postJobAd);
router.get('/:id', jobAdController.getJobAd);
router.put('/:id', jobAdController.updateJobAd);
router.delete('/:id', jobAdController.deleteJobAd);

module.exports = router;
