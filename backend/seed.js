const mongoose = require('mongoose');
const Role = require('./models/Role');
const User = require('./models/User');
require('dotenv').config();

const defaultRoles = [
  {
    name: 'SuperAdmin',
    description: 'Full system access',
    permissions: ['create', 'edit', 'delete', 'publish', 'view'],
    isCustom: false
  },
  {
    name: 'Manager',
    description: 'Can manage and publish content',
    permissions: ['create', 'edit', 'publish', 'view'],
    isCustom: false
  },
  {
    name: 'Contributor',
    description: 'Can create and edit own content',
    permissions: ['create', 'edit', 'view'],
    isCustom: false
  },
  {
    name: 'Viewer',
    description: 'Can only view published content',
    permissions: ['view'],
    isCustom: false
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');

    // Create default roles
    for (const roleData of defaultRoles) {
      const role = new Role(roleData);
      await role.save();
      console.log(`Created role: ${role.name}`);
    }

    console.log('\n Database seeded successfully!');
    console.log('Default roles created:');
    defaultRoles.forEach(role => {
      console.log(`  - ${role.name}: ${role.permissions.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();