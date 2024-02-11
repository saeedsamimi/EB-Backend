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

// using this before sign in for hashing the password
function generateHash(req, res, next) {
  bcrypt.genSalt(10, function (err, salt) {
    // in error send status 500
    if (err) return res.status(500);
    // else let's generate the hash using bcrypt
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      // if error return internal server error with 500 status
      if (err) return res.status(500);
      req.body.password = hash;
      next();
    });
  });
}

// this middleware used for verifying the user's password using bcrypt library
function verifyPassword(req, res) {
  bcrypt.compare(req.body.password, req.hash, function (err, result) {
    if (err) return res.status(500);
    if (result) {
      res.json({
        result: true,
        token: generateAccessToken(req.body.username),
      });
    } else {
      res.json({ result: false, msg: "your password not correct!" });
    }
  });
}

const corsOptions = {
  origin: process.env.ALLOW_ORIGIN,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

app.post("/signin", generateHash, function (req, res) {
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

app.post(
  "/login",
  (req, res, next) => {
    const findUser =
      req.body.method === "1"
        ? { email: req.body.email }
        : { username: req.body.username };
    userModel
      .findOne(findUser)
      .then(function (user) {
        req.hash = user.password;
        next();
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ result: false, msg: "the user not exist!" });
      });
  },
  verifyPassword
);

app.post("/Auth", authenticateToken, (req, res) => {
  userModel
    .findOne({ username: req.user.username })
    .then((result) => {
      res.json({
        username: result.username,
        email: result.email,
        firstname: result.firstname,
        lastname: result.lastname,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/rename", authenticateToken, function (req, res) {
  userModel
    .updateOne(req.user.username, {
      $set: { firstname: req.body.firstname, lastname: req.body.lastname },
    })
    .then((v) => {
      res.json({
        username: v.username,
        email: v.email,
        firstname: v.firstname,
        lastname: v.lastname,
      });
    })
    .catch((err) => {
      res.status(500).send("An error occured!");
    });
});

app.get("/", (req, res) => {
  res.send("HELLO WELCOME ❤");
});

app.listen(process.env.PORT, () => {
  console.log("The server is running with port : " + process.env.PORT);
});
