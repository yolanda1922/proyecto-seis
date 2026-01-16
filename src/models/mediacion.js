const mongoose = require("mongoose");

const mediacionSchema = mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, required: true },
  estado: { type: String, required: true },
}, {
  timestamps: true
});

const mediacion = mongoose.model("Mediacion", mediacionSchema);
module.exports = mediacion;
