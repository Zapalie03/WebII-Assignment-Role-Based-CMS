const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, isSuperAdmin, hasRole } = require('../middleware/authMiddleware');

// All role routes require authentication
router.use(verifyToken);

// @route   GET /api/roles
// @desc    Get all roles
// @access  Private (SuperAdmin only)
router.get('/', isSuperAdmin, roleController.getAllRoles);

// @route   GET /api/roles/access-matrix
// @desc    Get access matrix (which role has which permissions)
// @access  Private (Manager and above)
router.get('/access-matrix', hasRole(['Manager', 'SuperAdmin']), roleController.getAccessMatrix);

// @route   POST /api/roles
// @desc    Create a new custom role
// @access  Private (SuperAdmin only)
router.post('/', isSuperAdmin, roleController.createRole);

// @route   PUT /api/roles/:id
// @desc    Update role permissions
// @access  Private (SuperAdmin only)
router.put('/:id', isSuperAdmin, roleController.updateRole);

module.exports = router;