const express = require("express");
const { createUser, loginUser, checkAuth, checkAuthStatus, logout, resetPassword, resetPasswordRequest, googleLogin } = require("../controller/Auth");
const router = express.Router();

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateStore = new Map();

function authRateLimiter(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const current = rateStore.get(key);

  if (!current || now - current.start > RATE_LIMIT_WINDOW_MS) {
    rateStore.set(key, { count: 1, start: now });
    return next();
  }

  current.count += 1;
  if (current.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ success: false, message: "Too many auth requests. Try again later." });
  }

  return next();
}

router
  .post("/signup", authRateLimiter, createUser)
  .post("/login", authRateLimiter, loginUser)
  .post("/google", authRateLimiter, googleLogin)
  .get("/check", checkAuthStatus)
  .get("/logout",logout)
  .post('/reset-password-request', authRateLimiter, resetPasswordRequest)
  .post('/reset-password', authRateLimiter, resetPassword)

exports.router = router;
 