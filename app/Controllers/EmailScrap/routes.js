const express = require('express');
const router = express.Router();

const EmailScrapController = require('./EmailScrapController');  

router.post('/scrap/email-scrap', EmailScrapController.emailScrapper); 
module.exports = router;