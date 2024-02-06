const mocha = require("mocha");
const assert = require("assert");
const userModel = require("../models/users");
const tempUser = require("./test.config");

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
});
