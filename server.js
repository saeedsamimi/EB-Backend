const express = require("express"),
  app = express(),
  userModel = require("./models/users"),
  employeeModel = require("./models/employee"),
  cors = require("cors"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  multer = require("multer"),
  mongoose = require(mongoose);
const upload = multer();
require("dotenv").config();
require("./database/connection");

const corsOptions = {
  origin: process.env.ALLOW_ORIGIN,
  optionsSuccessStatus: 200,
};

function generateAccessToken(username) {
  return jwt.sign({ username: username }, process.env.SECURE_TOKEN, {
    expiresIn: "2 days",
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
function verifyPassword(req, res, next) {
  bcrypt.compare(req.body.password, req.hash, function (err, result) {
    if (err) return res.status(500).send("error occured!");
    if (result) {
      next();
    } else {
      res.status(403).send("your password not correct!");
    }
  });
}

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
        if (user) {
          req.hash = user.password;
          next();
        } else throw new Error();
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ result: false, msg: "the user not exist!" });
      });
  },
  verifyPassword,
  function (req, res) {
    res.json({
      result: true,
      token: generateAccessToken(req.body.username),
    });
  }
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

app.post("/rename", authenticateToken, upload.none(), function (req, res) {
  userModel
    .updateOne(
      { username: req.user.username },
      {
        $set: { firstname: req.body.firstname, lastname: req.body.lastname },
      }
    )
    .then((v) => {
      res.json({ firstname: req.body.firstname, lastname: req.body.lastname });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("An error occured!");
    });
});

app.post(
  "/changepass",
  upload.none(),
  function (req, res, next) {
    if (req.body.password === req.body.newpass) {
      res.status(400).send("the password is same as the current pass!");
    } else if (req.body.newpass !== req.body.repeatpass) {
      res
        .status(400)
        .send("The reapeated password is not as same as the new password!");
    } else {
      next();
    }
  },
  authenticateToken,
  function (req, res, next) {
    userModel
      .findOne({ username: req.user.username })
      .then(function (user) {
        req.hash = user.password;
        next();
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("the user not exist!");
      });
  },
  verifyPassword,
  function (req, res, next) {
    req.body.password = req.body.newpass;
    next();
  },
  generateHash,
  function (req, res) {
    userModel
      .updateOne(
        { username: req.user.username },
        { $set: { password: req.body.password } }
      )
      .then((v) => res.send("The password changed successfully!"))
      .catch((error) =>
        res.status(500).send("error while changing the password!")
      );
  }
);

async function findUserId(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    if (user) {
      req.user.id = user._id;
      next();
    } else res.status(403);
  } catch (err) {
    res.status(500).send("An error occured: " + err.code);
  }
}

app.post(
  "/addemployee",
  upload.none(),
  authenticateToken,
  findUserId,
  async (req, res) => {
    try {
      const employee = new employeeModel(req.body);
      employee.boss = req.user.id;
      await employee.save();
      if (employee.isNew) {
        res
          .status(500)
          .send(
            "the employee cannot save. please check the inputs or try again later!"
          );
      } else res.send("The new employee was inserted successfully");
    } catch (err) {
      res.send("Error: " + (err.message || err.code));
    }
  }
);

app.get("/getemployee", authenticateToken, findUserId, async (req, res) => {
  try {
    const searchRes = await employeeModel.find({ boss: req.user.id });
    res.json(searchRes);
  } catch (err) {
    res.send("Error: " + (err.message || err.code));
  }
});

app.post(
  "/editemployee",
  upload.none(),
  authenticateToken,
  async (req, res) => {
    try {
      objectId = mongoose.Types.ObjectId.createFromHexString(req.body.id);
      console.log(objectId);
      await employeeModel.findByIdAndUpdate(objectId, { $set: req.body });
      res.send("The Update was successfull!");
    } catch (err) {
      res.send("Error: " + (err.message || err.code));
    }
  }
);

app.get("/", (req, res) => {
  res.send("HELLO WELCOME ❤");
});

app.listen(process.env.PORT, () => {
  console.log("The server is running with port : " + process.env.PORT);
});
