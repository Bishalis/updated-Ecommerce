const express = require("express");
const { createUser, loginUser, checkAuth, checkAuthStatus, logout, resetPassword, resetPasswordRequest, googleLogin } = require("../controller/Auth");
const router = express.Router();

router
  .post("/signup", createUser)
  .post("/login",  loginUser)
  .post("/google", googleLogin)
  .get("/check", checkAuthStatus)
  .get("/logout",logout)
  // .post('/reset-password-request', resetPasswordRequest)
  // .post('/reset-password', resetPassword)

exports.router = router;
 