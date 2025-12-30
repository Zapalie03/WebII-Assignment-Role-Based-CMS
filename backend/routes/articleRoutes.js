const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { verifyToken, hasPermission } = require('../middleware/authMiddleware');

// All article routes require authentication
router.use(verifyToken);

// @route   GET /api/articles
// @desc    Get all articles (role-based filtering)
// @access  Private
router.get('/', articleController.getArticles);

// @route   GET /api/articles/:id
// @desc    Get single article
// @access  Private
router.get('/:id', articleController.getArticle);

// @route   POST /api/articles
// @desc    Create a new article
// @access  Private (Requires create permission)
router.post('/', hasPermission('create'), articleController.createArticle);

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Requires edit permission)
router.put('/:id', hasPermission('edit'), articleController.updateArticle);

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Requires delete permission)
router.delete('/:id', hasPermission('delete'), articleController.deleteArticle);

// @route   PUT /api/articles/:id/publish
// @desc    Publish/unpublish article
// @access  Private (Requires publish permission)
router.put('/:id/publish', hasPermission('publish'), articleController.togglePublish);

module.exports = router;