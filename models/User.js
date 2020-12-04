const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    _id :{
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "user",
      enum: ["finance", "admin", "sales", "hr", "tech"]
    },
    path: {
      type: String,
    },
  }
);

module.exports = model("users", UserSchema);
