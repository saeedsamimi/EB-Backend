const express = require("express");
const app = express();
const userModel = require("./models/users");
const tempUser = require("./test/test.config");
require("./database/connection");
require("dotenv").config();

app.get("/", (req, res) => {
  userModel
    .insertMany(tempUser)
    .then(() => {
      res.send("already inserted🧡💚");
    })
    .catch((error) => {
      res.send("cannot send! 😢");
      console.error(error);
    });
});

app.listen(process.env.PORT, () => {
  console.log(
    "The server is running .😎.on localhost with port : " + process.env.PORT
  );
});
