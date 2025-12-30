const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (SuperAdmin only)
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: roles.length,
      roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching roles'
    });
  }
};

// @desc    Create a new custom role
// @route   POST /api/roles
// @access  Private (SuperAdmin only)
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Name and permissions array are required'
      });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    // Validate permissions
    const validPermissions = ['create', 'edit', 'delete', 'publish', 'view'];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`
      });
    }

    // Ensure view permission is included
    const finalPermissions = permissions.includes('view') 
      ? permissions 
      : [...permissions, 'view'];

    const role = new Role({
      name,
      description: description || '',
      permissions: finalPermissions,
      isCustom: true,
      createdBy: req.userId
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: 'Custom role created successfully',
      role
    });

  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating role',
      error: error.message
    });
  }
};

// @desc    Update role permissions
// @route   PUT /api/roles/:id
// @access  Private (SuperAdmin only)
exports.updateRole = async (req, res) => {
  try {
    const { permissions } = req.body;

    // Validate permissions
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions array is required'
      });
    }

    const validPermissions = ['create', 'edit', 'delete', 'publish', 'view'];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`
      });
    }

    // Ensure view permission is included
    const finalPermissions = permissions.includes('view') 
      ? permissions 
      : [...permissions, 'view'];

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent updating system roles if needed
    if (!role.isCustom) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify system roles'
      });
    }

    role.permissions = finalPermissions;
    role.description = req.body.description || role.description;
    
    await role.save();

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      role
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating role',
      error: error.message
    });
  }
};

// @desc    Get access matrix (which role has which permissions)
// @route   GET /api/roles/access-matrix
// @access  Private (Manager+)
exports.getAccessMatrix = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    
    const matrix = roles.map(role => ({
      role: role.name,
      isCustom: role.isCustom,
      permissions: role.permissions,
      description: role.description
    }));

    res.status(200).json({
      success: true,
      matrix
    });
  } catch (error) {
    console.error('Access matrix error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching access matrix'
    });
  }
};