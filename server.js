const express = require("express"),
  app = express(),
  userModel = require("./models/users"),
  cors = require("cors"),
  bcrypt = require("bcrypt");
require("./database/connection");
require("dotenv").config();

function generateAccessToken(username) {
  return jwt.sign(username, process.env.SECURE_TOKEN, { expiresIn: "1800s" });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    // taking log from the error
    console.log(err);
    // set the error state of the result
    if (err) return res.sendStatus(403);
    // init user real value
    req.user = user;
    // then go to the next middleware EXPRESS.js function
    next();
  });
}

app.use(express.json());
app.use(cors());

app.post("/signin", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      req.body.password = hash;
      userModel
        .insertMany(req.body)
        .then(() => {
          const jwt_token = generateAccessToken(req.body.username);
          res.json({ result: true, token: jwt_token });
        })
        .catch((error) => {
          if (error.code === 11000) {
            res.status(500).json({
              result: false,
              msg: "cannot SignIn!",
              reason: "the username or email already exists!",
            });
          } else {
            res.status(500).json({
              result: false,
              msg: "An error occured",
              reason: "an unexpected error occured!",
            });
          }
        });
    });
  });
});

app.post("/login", authenticateToken, (req, res) => {
  const findUser = { username: req.body.username, email: req.body.email };
  userModel
    .findOne(findUser)
    .then(function ({ password }) {
      bcrypt.compare(req.body.password, password, function (err, result) {
        if (result) {
          res.json({ result: true });
        } else {
          res.json({ result: false, msg: "your password not correct!" });
        }
      });
    })
    .catch((error) => {
      res.status(500).json({ result: false, msg: "the user not exist!" });
    });
});

app.listen(process.env.PORT, () => {
  console.log("The server is running with port : " + process.env.PORT);
});
