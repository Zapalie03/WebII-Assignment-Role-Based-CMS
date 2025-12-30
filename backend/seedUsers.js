// seedUsers.js
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

const defaultUsers = [
  {
    fullName: 'System Administrator',
    email: 'admin@example.com',
    password: 'password123',
    role: 'SuperAdmin',
    profilePhoto: null
  },
  {
    fullName: 'Content Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'Manager',
    profilePhoto: null
  },
  {
    fullName: 'Content Contributor',
    email: 'contributor@example.com',
    password: 'password123',
    role: 'Contributor',
    profilePhoto: null
  },
  {
    fullName: 'General Viewer',
    email: 'viewer@example.com',
    password: 'password123',
    role: 'Viewer',
    profilePhoto: null
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create default users
    for (const userData of defaultUsers) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log('\n Users seeded successfully!');
    console.log('\n Test Credentials:');
    console.log('===================');
    defaultUsers.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('User seeding error:', error);
    process.exit(1);
  }
}

seedUsers();