const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create schema for employees
const employeeSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  job: String,
  salary: Number,
  boss: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    select: false,
  },
});
// Create Employee model using mongoose ORM
const employeeModel = mongoose.model("employee", employeeSchema);
// export the model
module.exports = employeeModel;
