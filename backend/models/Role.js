// models/Role.js - Role model for dynamic role-based permissions
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    enum: ['create', 'edit', 'delete', 'publish', 'view'],
    required: true
  }],
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// REMOVED THE PRE-SAVE HOOK - Mongoose 7+ compatibility
// No pre-save hook needed since seed data already includes 'view'

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;