const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    mobile: { type: String, required: false },
    email: { type: String, required: true, unique: true }, // Ensure email is unique
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'carrier', 'user'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
