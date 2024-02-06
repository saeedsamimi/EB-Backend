const express = require("express");
const app = express();
const userModel = require("./models/users");
const cors = require("cors");
require("./database/connection");
require("dotenv").config();

app.use(express.json());
app.use(cors());

app.get("/signin", (req, res) => {
  userModel
    .insertMany(req.body)
    .then(() => {
      res.json({ msg: "You are signed in!" });
    })
    .catch((error) => {
      if (error.code === 11000) {
        res.json({
          msg: "cannot SignIn!",
          reason: "the username or email already exists!",
        });
      } else {
        res.json({
          msg: "An error occured",
          reason: "an unexpected error occured!",
        });
      }
      res.status(500);
    });
});

app.listen(process.env.PORT, () => {
  console.log("The server is running with port : " + process.env.PORT);
});
