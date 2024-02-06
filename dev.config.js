require("dotenv").config();

module.exports = {
  db: {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASS,
    host: process.env.MONGODB_HOST,
    port: process.env.MONGODB_PORT,
    db: process.env.MONGODB_DATABASE,
    add: process.env.MONGODB_ADDITIONAL,
  },
};
