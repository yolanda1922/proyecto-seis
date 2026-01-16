
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  fecha: { type: Date, required: true },
  estado: { type: String, required: true },
}, {
  timestamps: true
});

const user = mongoose.model("User", userSchema);
module.exports = user;

