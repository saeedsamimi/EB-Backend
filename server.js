const express = require("express"),
  app = express(),
  userModel = require("./models/users"),
  cors = require("cors"),
  bcrypt = require("bcrypt");
require("./database/connection");
require("dotenv").config();

app.use(express.json());
app.use(cors());

app.post("/signin", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      req.body.password = hash;
      userModel
        .insertMany(req.body)
        .then(() => {
          res.json({ msg: "You are signed in!" });
        })
        .catch((error) => {
          if (error.code === 11000) {
            res.status(500).json({
              msg: "cannot SignIn!",
              reason: "the username or email already exists!",
            });
          } else {
            res.status(500).json({
              msg: "An error occured",
              reason: "an unexpected error occured!",
            });
          }
        });
    });
  });
});

app.post("/login", (req, res) => {
  const findUser = { username: req.body.username, email: req.body.email };
  userModel
    .findOne(findUser)
    .then(function ({ password }) {
      bcrypt.compare(req.body.password, password, function (err, result) {
        if (result) {
          res.json({ msg: "you are signed in!" });
        } else {
          res.json({ msg: "you password not correct!" });
        }
      });
    })
    .catch((error) => {
      res.status(500).json({ msg: "the user not exist!" });
    });
});

app.listen(process.env.PORT, () => {
  console.log("The server is running with port : " + process.env.PORT);
});
