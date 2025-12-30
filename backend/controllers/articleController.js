const Article = require('../models/Article');
const User = require('../models/User');

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Requires create permission)
exports.createArticle = async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const article = new Article({
      title,
      content,
      image: image || '',
      author: req.userId,
      tags: tags || []
    });

    await article.save();

    // Populate author info
    await article.populate('author', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article
    });

  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating article',
      error: error.message
    });
  }
};

// @desc    Get all articles (with role-based filtering)
// @route   GET /api/articles
// @access  Private
exports.getArticles = async (req, res) => {
  try {
    let query = {};
    const userRole = req.user.role.name;

    // Role-based filtering
    if (userRole === 'Viewer') {
      // Viewer can only see published articles
      query.isPublished = true;
    } else if (userRole === 'Contributor') {
      // Contributors see published articles + their own drafts
      query = {
        $or: [
          { isPublished: true },
          { author: req.userId }
        ]
      };
    }
    // Manager and SuperAdmin see all articles (no filter)

    const articles = await Article.find(query)
      .populate('author', 'fullName email')
      .populate('role', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      userRole,
      articles
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching articles',
      error: error.message
    });
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Private
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'fullName email');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check access permissions
    if (!article.isPublished) {
      // Only author, Manager, or SuperAdmin can view drafts
      const isAuthor = article.author._id.toString() === req.userId;
      const isManagerOrAdmin = ['Manager', 'SuperAdmin'].includes(req.user.role.name);
      
      if (!isAuthor && !isManagerOrAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Article is not published.'
        });
      }
    }

    res.status(200).json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching article',
      error: error.message
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Requires edit permission)
exports.updateArticle = async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user can edit this article
    // Authors can edit their own articles
    // Manager/SuperAdmin can edit any article
    const isAuthor = article.author.toString() === req.userId;
    const isManagerOrAdmin = ['Manager', 'SuperAdmin'].includes(req.user.role.name);
    
    if (!isAuthor && !isManagerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own articles.'
      });
    }

    // Update article
    article.title = title || article.title;
    article.content = content || article.content;
    article.image = image || article.image;
    article.tags = tags || article.tags;

    await article.save();
    await article.populate('author', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      article
    });

  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating article',
      error: error.message
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Requires delete permission)
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user can delete this article
    // Only Manager and SuperAdmin can delete articles
    const isManagerOrAdmin = ['Manager', 'SuperAdmin'].includes(req.user.role.name);
    
    if (!isManagerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only managers and admins can delete articles.'
      });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting article',
      error: error.message
    });
  }
};

// @desc    Publish/unpublish article
// @route   PUT /api/articles/:id/publish
// @access  Private (Requires publish permission)
exports.togglePublish = async (req, res) => {
  try {
    const { publish } = req.body; // true to publish, false to unpublish
    
    if (typeof publish !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Publish field must be true or false'
      });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Only Manager and SuperAdmin can publish/unpublish
    const isManagerOrAdmin = ['Manager', 'SuperAdmin'].includes(req.user.role.name);
    
    if (!isManagerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only managers and admins can publish articles.'
      });
    }

    article.isPublished = publish;
    if (publish && !article.publishedAt) {
      article.publishedAt = new Date();
    }

    await article.save();
    await article.populate('author', 'fullName email');

    res.status(200).json({
      success: true,
      message: `Article ${publish ? 'published' : 'unpublished'} successfully`,
      article
    });

  } catch (error) {
    console.error('Publish article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating article status',
      error: error.message
    });
  }
};