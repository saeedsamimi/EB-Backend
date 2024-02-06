require("dotenv").config({ path: "./test/.env" });

module.exports = {
  username: process.env.TEST_USER_USERNAME,
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
};
