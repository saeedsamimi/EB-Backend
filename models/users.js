const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema of model
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: String,
    lastname: String,
  },
  { _id: false } // disable ID because i have unique username an email instead
);
// Create User model
const userModel = mongoose.model("user", userSchema);
// export the model
module.exports = userModel;
