// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemCode: { type: String, required: true, unique: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  qty: { type: Number, required: true, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Link to user for auth
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);