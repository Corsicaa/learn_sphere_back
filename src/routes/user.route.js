const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logoutUser);
router.get("/connected", userController.userConnected);
router.get("/:id", userController.selectUser);

module.exports = router;