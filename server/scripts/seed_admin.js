require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import db connections to trigger connectivity
const { adminDb } = require('../config/db');

// Import Admin models
const Permission = require('../models/admin/Permission');
const Role = require('../models/admin/Role');
const User = require('../models/admin/User');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedAdmin() {
  console.log('\n--- Starting Admin Database Seeding Script ---\n');
  console.log('Waiting for Mongoose connections...');
  await sleep(1500);

  try {
    // 1. Upsert Permission
    console.log('Syncing Admin Permission...');
    let permission = await Permission.findOne({ code: 'admin_access' });
    if (!permission) {
      permission = await Permission.create({
        name: 'Admin Panel Access',
        code: 'admin_access'
      });
      console.log(`✓ Permission 'admin_access' created.`);
    } else {
      console.log(`- Permission 'admin_access' already exists.`);
    }

    // 2. Upsert Role
    console.log('Syncing Admin Role...');
    let role = await Role.findOne({ name: 'Admin' });
    if (!role) {
      role = await Role.create({
        name: 'Admin',
        permissions: [permission._id]
      });
      console.log(`✓ Role 'Admin' created.`);
    } else {
      role.permissions = [permission._id];
      await role.save();
      console.log(`✓ Role 'Admin' verified and permission linked.`);
    }

    // 3. Upsert User
    console.log('Syncing Admin User...');
    const email = 'admin@gmail.com';
    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: 'admin',
        email: email,
        password: hashedPassword,
        role: role._id
      });
      console.log(`✓ Admin user '${email}' created successfully.`);
    } else {
      user.username = 'admin';
      user.password = hashedPassword;
      user.role = role._id;
      await user.save();
      console.log(`✓ Admin user '${email}' password and role updated.`);
    }

    console.log('\n=======================================');
    console.log(' ADMIN SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================');
  } catch (error) {
    console.error('✗ Seeding error:', error);
  } finally {
    console.log('Closing database connections...');
    await adminDb.close();
    process.exit(0);
  }
}

seedAdmin();
