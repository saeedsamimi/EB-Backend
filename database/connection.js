// improt or require mongoDB mmongoose package!
const mongoose = require("mongoose");
// include the dev.config
const db = require("../dev.config").db;
// enabling the ES6 global promises
mongoose.Promise = global.Promise;
// configuring url
const url =
  "mongodb://" +
  db.user +
  ":" +
  db.pass +
  "@" +
  db.host +
  ":" +
  db.port +
  "/" +
  db.db +
  "?" +
  db.add;
// Connect to db
mongoose.connect(url);
// use abbreviative form of mongoose.connection...
const connection = mongoose.connection;
// set connection open event listeners
connection.once("open", () => {
  console.log("connection opened!, Firework... 🌹");
});
// set connection error event listener
connection.on("error", function (error) {
  console.log(
    "❌Error occured with message: ",
    error.msg,
    " nor code: ",
    error.code
  );
});
