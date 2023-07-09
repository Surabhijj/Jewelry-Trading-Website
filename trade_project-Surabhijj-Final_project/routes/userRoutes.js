const express = require("express");
const controller = require("../controllers/userController");
const {isGuest} = require('../middlewares/auth');
const {isLoggedIn} = require('../middlewares/auth');
const {logInLimiter} = require('../middlewares/rateLimiters');
const {validateSignUp, validateLogin, validateResult} = require('../middlewares/validator');



const router = express.Router();

router.get("/new", isGuest, controller.new);

//POST /users: create a new user
router.post("/", isGuest,validateSignUp,validateResult, controller.create);

//GET /users/login: send html form for user login
router.get("/login", isGuest, controller.login);

//POST /users: authenticates the user
router.post("/login", logInLimiter,isGuest,validateLogin,validateResult, controller.authenticate);

//GET /users/profile: show details of the user
router.get("/profile", isLoggedIn,controller.profile);

//GET /users/logout: logout the user
router.get("/logout", controller.logout);



module.exports = router;
