// server.js - Complete Role-Based CMS Backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const roleRoutes = require('./routes/roleRoutes');

// Create Express app
const app = express();

// ==================== CONFIGURATION ====================

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(cors({
  origin: 'http://localhost:4200', // Your Angular app URL
  credentials: true, // Allow cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// ==================== BASIC ROUTES (MUST WORK) ====================

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Role-Based CMS API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      articles: '/api/articles',
      roles: '/api/roles',
      docs: '/api',
      health: '/health'
    }
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      articles: {
        getAll: 'GET /api/articles',
        create: 'POST /api/articles',
        update: 'PUT /api/articles/:id',
        delete: 'DELETE /api/articles/:id',
        publish: 'PUT /api/articles/:id/publish'
      },
      roles: {
        getAll: 'GET /api/roles',
        create: 'POST /api/roles',
        accessMatrix: 'GET /api/roles/access-matrix'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// ==================== API ROUTES ====================

// Load all API routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/roles', roleRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
Server running on port ${PORT}

Available endpoints:
  http://localhost:${PORT}/
  http://localhost:${PORT}/api
  http://localhost:${PORT}/health
  http://localhost:${PORT}/api/auth
  http://localhost:${PORT}/api/articles
  http://localhost:${PORT}/api/roles
      `);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

module.exports = app;