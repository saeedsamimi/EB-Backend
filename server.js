const express = require("express"),
  app = express(),
  userModel = require("./models/users"),
  cors = require("cors"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken");
require("dotenv").config();
require("./database/connection");

function generateAccessToken(username) {
  return jwt.sign({ username: username }, process.env.SECURE_TOKEN, {
    expiresIn: "1h",
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECURE_TOKEN, (err, user) => {
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
          console.log(error);
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

app.post("/login", (req, res) => {
  const findUser =
    req.body.method === "1"
      ? { email: req.body.email }
      : { username: req.body.username };
  userModel
    .findOne(findUser)
    .then(function (user) {
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (result) {
          res.json({
            result: true,
            token: generateAccessToken(req.body.username),
          });
        } else {
          res.json({ result: false, msg: "your password not correct!" });
        }
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ result: false, msg: "the user not exist!" });
    });
});

app.post("/Auth", authenticateToken, (req, res) => {
  res.send(req.user.username);
});

app.get("/", (req, res) => {
  res.send("HELLO WELCOME ❤");
});

app.listen(process.env.PORT, () => {
  console.log("The server is running with port : " + process.env.PORT);
});
