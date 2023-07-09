const { application } = require('express');
const express = require('express');
const controller = require('../controllers/mainSite_Controller');
const router = express.Router();


router.get('/about',controller.about);

router.get('/contact',controller.contact);


module.exports = router;