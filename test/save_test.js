const mocha = require("mocha");
const assert = require("assert");
const userModel = require("../models/users");
const tempUser = require("./test.config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

describe("Test saving the data", function (done) {
  it("save the first one", function () {
    userModel
      .insertMany(tempUser)
      .then(() => {
        assert(model.isNew === true);
        done();
      })
      .catch((error) => {
        assert(model.isNew === true, error.code || error.message);
        done();
      });
  });

  it("generate the web token using JWT", function () {
    crypto.randomBytes(32, (err, buf) => {
      if (err) throw err;
      console.log("the token generated: " + buf.toString("base64"));
    });
  });
});
