const { model, Schema } = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!isEmail(value)) {
          throw new Error("Email must be a properly formatted email address");
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password must not contain 'password'");
        }
        if (value.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
      }
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      }
    },
    tokens: [{
      token: {
        type: String,
        required: true
      }
    }]
  },
  {
    timestamps: true
  }
);

userSchema.methods.getPublicProfile = async function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password
  delete userObject.tokens
  return userObject

}
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({
    "_id": user._id.toString()
  }, process.env.JWT_SECRET)
  user.tokens = user.tokens.concat({
    token
  })

  await user.save();
  return token
}
//Hash the plain text password
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next()
})

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to Login');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to Login');
  }
  return user
}

const User = model("User", userSchema);

module.exports = User;
