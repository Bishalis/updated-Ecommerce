const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser, sendMail, createSecretToken } = require("./Services/Common");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.createUser = async (req, res, next) => {
  try {
    const { email, password, username, role, createdAt } = req.body;
    
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
      role: role || 'user',
      createdAt: createdAt || new Date()
    });

    // Generate token
    const token = createSecretToken(user._id);
    
    // Set cookie
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    // Send success response
    res.status(201).json({ 
      message: "User signed up successfully", 
      success: true, 
      user 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Internal server error", 
      success: false,
      error: error.message 
    });
  }
};

// Middleware for protecting routes
exports.checkAuth = async (req, res, next) => {
  let token = req.cookies.token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ status: false, message: 'No token provided' });
  }
  jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
    if (err) {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    } else {
      const user = await User.findById(data.id);
      if (user) {
        // Set user in request object and continue
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
    }
  });
};

// API endpoint for checking authentication status
exports.checkAuthStatus = async (req, res) => {
  let token = req.cookies.token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ status: false, message: 'No token provided' });
  }
  jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
    if (err) {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    } else {
      const user = await User.findById(data.id);
      if (user) {
        // Return user info (including role)
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
    }
  });
};


exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if(!email || !password ){
      return res.status(400).json({message:'All fields are required', success: false});
    }
    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({message:'Incorrect password or email', success: false}); 
    }
    const auth = await bcrypt.compare(password,user.password)
    if (!auth) {
      return res.status(401).json({message:'Incorrect password or email', success: false}); 
    }
    const token = createSecretToken(user.id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
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
      httpOnly: true,
    })
    .sendStatus(200);
};

exports.resetPasswordRequest = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  if (user) {
    const token = crypto.randomBytes(48).toString("hex");
    user.resetPasswordToken = token;
    await user.save();

    // Also set token in email
    const resetPageLink =
      "http://localhost:3000/reset-password?token=" + token + "&email=" + email;
    const subject = "reset password for e-commerce";
    const html = `<p>Click <a href='${resetPageLink}'>here</a> to Reset Password</p>`;

    // lets send email and a token in the mail body so we can verify that user has clicked right link

    if (email) {
      const response = await sendMail({ to: email, subject, html });
      res.json(response);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
};

exports.resetPassword = async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email: email, resetPasswordToken: token });
  if (user) {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        user.password = hashedPassword;
        user.salt = salt;
        await user.save();
        const subject = "password successfully reset for e-commerce";
        const html = `<p>Successfully able to Reset Password</p>`;
        if (email) {
          const response = await sendMail({ to: email, subject, html });
          res.json(response);
        } else {
          res.sendStatus(400);
        }
      }
    );
  } else {
    res.sendStatus(400);
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
        password: crypto.randomBytes(32).toString('hex'), // Random password for Google users
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
    res.cookie("token", jwtToken, {
      withCredentials: true,
      httpOnly: false,
    });

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
      success: false,
      error: error.message
    });
  }
};
