const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser, sendMail, createSecretToken } = require("./Services/Common");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config();

const JWT_SECRET = process.env.SECRET_KEY || process.env.JWT_SECRET;
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.createUser = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
        if (typeof password !== "string" || password.length < 8) {
          return res.status(400).json({
            message: "Password must be at least 8 characters long",
            success: false,
          });
        }

    
    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: "All fields are required",
        success: false 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists",
        success: false 
      });
    }

    // Create new user
    const user = await User.create({ 
      email, 
      password, 
      username,
      role: 'user',
      createdAt: createdAt || new Date()
    });

    // Generate token
    const token = createSecretToken(user._id);
    
    // Set cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    // Send success response
    res.status(201).json({ 
      message: "User signed up successfully", 
      success: true, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Internal server error", 
      success: false
    });
  }
};

// Middleware for protecting routes
exports.checkAuth = async (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ status: false, message: 'Server configuration error' });
  }

  let token = req.cookies.token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ status: false, message: 'No token provided' });
  }
  jwt.verify(token, JWT_SECRET, async (err, data) => {
    if (err) {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    } else {
      try {
        const user = await User.findById(data.id);
        if (user) {
          req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          };
          next();
        } else {
          return res.status(401).json({ status: false, message: 'User not found' });
        }
      } catch (dbError) {
        return res.status(500).json({ status: false, message: 'Auth lookup failed' });
      }
    }
  });
};

exports.checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ status: false, message: "Admin access required" });
  }
  next();
};

// API endpoint for checking authentication status
exports.checkAuthStatus = async (req, res) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ status: false, message: 'Server configuration error' });
  }

  let token = req.cookies.token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ status: false, message: 'No token provided' });
  }
  jwt.verify(token, JWT_SECRET, async (err, data) => {
    if (err) {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    } else {
      try {
        const user = await User.findById(data.id);
        if (user) {
          return res.status(200).json({
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        } else {
          return res.status(401).json({ status: false, message: 'User not found' });
        }
      } catch (dbError) {
        return res.status(500).json({ status: false, message: 'Auth lookup failed' });
      }
    }
  });
};


exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if(!email || !password ){
      return res.status(400).json({message:'All fields are required', success: false});
    }

    if (!JWT_SECRET) {
      console.error("JWT secret is not configured");
      return res.status(500).json({
        message: "Server configuration error",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({message:'Incorrect password or email', success: false}); 
    }

    // Accounts created via Google may not have a usable password hash for email login.
    if (!user.password || typeof user.password !== "string") {
      return res.status(400).json({
        message: "This account uses Google sign-in. Please continue with Google.",
        success: false,
      });
    }

    let auth = false;
    try {
      auth = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      console.error("Password comparison failed:", compareError.message);
      return res.status(400).json({
        message: "Unable to login with password for this account. Try resetting password.",
        success: false,
      });
    }

    if (!auth) {
      return res.status(401).json({message:'Incorrect password or email', success: false}); 
    }
    const token = createSecretToken(user.id);
    res.cookie("token", token, COOKIE_OPTIONS);
    // Return user info (including role) and token
    return res.status(201).json({ 
      message: "User logged in successfully", 
      success: true, 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal server error", success: false});
  }
}



exports.logout = async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      ...COOKIE_OPTIONS,
    })
    .sendStatus(200);
};

exports.resetPasswordRequest = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, a reset email has been sent",
      });
    }

    const token = crypto.randomBytes(48).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetPageLink = `${frontendBase}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const subject = "Reset password for e-commerce";
    const html = `<p>Click <a href='${resetPageLink}'>here</a> to reset your password.</p>`;

    await sendMail({ to: email, subject, html });

    return res.status(200).json({
      success: true,
      message: "If the account exists, a reset email has been sent",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to process reset request" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    if (!email || !password || !token) {
      return res.status(400).json({ success: false, message: "Email, token, and password are required" });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const subject = "Password reset successful";
    const html = `<p>Your password has been reset successfully.</p>`;
    await sendMail({ to: email, subject, html });

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        message: "Google token is required", 
        success: false 
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      const username = name.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substring(2, 8);
      
      user = await User.create({
        email,
        username,
        role: 'user',
        googleId,
        profilePicture: picture,
        createdAt: new Date()
      });
    } else {
      // Update existing user's Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture) user.profilePicture = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const jwtToken = createSecretToken(user._id);
    
    // Set cookie
    res.cookie("token", jwtToken, COOKIE_OPTIONS);

    // Return success response
    return res.status(200).json({
      message: "Google login successful",
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      message: "Google login failed",
      success: false
    });
  }
};
