const express = require('express');
const router = express.Router();

const UserController = require('./UserController');  
const jwtHelper = require('./middleware');  

router.post('/user/login', UserController.login); 
router.post('/user/register',jwtHelper.verifyUserJwtToken, UserController.register); 
router.post('/user/update',jwtHelper.verifyUserJwtToken, UserController.update); 
router.get('/users',jwtHelper.verifyUserJwtToken, UserController.listAllUser); 
router.get('/users/:id',jwtHelper.verifyUserJwtToken, UserController.getUser); 
router.post('/user/delete/:id',jwtHelper.verifyUserJwtToken, UserController.delete); 
module.exports = router;