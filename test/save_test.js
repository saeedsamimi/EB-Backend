const mocha = require("mocha");
const assert = require("assert");
const userModel = require("../models/users");

describe("Test saving the data", (done) => {
  it("save the first one", () => {
    var model = new userModel({
      username: "saeed",
      email: "doob@gmail.com",
      password: "12345678",
    });
    userModel
      .insertMany(model)
      .then(() => {
        console.log("I am one");
        assert(model.isNew === false, "Success");
        done();
      })
      .catch((error) => {
        assert(model.isNew === true, error);
        done();
      });
  });
});
