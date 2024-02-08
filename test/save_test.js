const mocha = require("mocha");
const assert = require("assert");
const should = require("should");
const testUser = require("./test.config");
const { user, pass, host, port, db, add } = require("../dev.config").db;
const mongoose = require("mongoose");
const userModel = require("../models/users");

const url =
  "mongodb://" +
  user +
  ":" +
  pass +
  "@" +
  host +
  ":" +
  port +
  "/" +
  db +
  "?" +
  add;

const connectDB = async () => {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected");
  } catch (error) {
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("disconnected successully!");
  } catch (error) {
    throw error;
  }
};

describe("Database Connection", function () {
  // Connect to the database before running tests
  before(async function () {
    await connectDB();
  });

  after(async function () {
    await disconnectDB();
  });

  // Test the database connection
  it("should connect to the database", function (done) {
    // Assert that the mongoose connection is not null
    should.exist(mongoose.connection);
    done();
  });

  it("should insert the new usr into the collection", function (done) {
    var testUserModel = new userModel(testUser);
    console.log(testUser);
    testUserModel.save(done);
  });
});
