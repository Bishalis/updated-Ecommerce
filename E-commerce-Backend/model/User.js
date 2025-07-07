const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs')


const userSchema = new Schema({
      role: { type: String, required: true,default:'user' },

       email: {
        type: String,
        required: [true, "Your email address is required"],
        unique: true,
      },
      username: {
        type: String,
        required: [true, "Your username is required"],
      },
      password: {
        type: String,
        required: function() {
          return !this.googleId; // Password only required if not a Google user
        },
      },
      googleId: {
        type: String,
        unique: true,
        sparse: true,
      },
      profilePicture: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: new Date(),
      },
      addresses: {
        type: [
          {
            name: String,
            email: String,
            city: String,
            state: String,
            pinCode: String,
            street: String,
            phone: String,
          }
        ],
        default: [],
      },
})

userSchema.pre("save", async function () {
    // Only hash password if it's not a Google user and password is modified
    if (!this.googleId && this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  });

exports.User = mongoose.model('User', userSchema)
