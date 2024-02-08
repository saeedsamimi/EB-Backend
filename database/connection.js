// improt or require mongoDB mmongoose package!
const mongoose = require("mongoose");
// include the dev.config
const { user, pass, host, port, db, add } = require("../dev.config").db;
// configuring url
const url =
  "mongodb://" +
  user +
  ":" +
  pass +
  "@" +
  host +
  ":" +
  port +
  "/" +
  db +
  "?" +
  add;
// use abbreviative form of mongoose.connection...
const connection = mongoose.connection;
mongoose.connect(url);
// set connection open event listeners
connection.once("open", () => {
  console.log("connected!!");
});
// set connection error event listener
connection.on("error", function (error) {
  console.log("Cannot connect to db with error message: ", error.msg);
});
