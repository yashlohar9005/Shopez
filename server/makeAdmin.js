require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Check if admin already exists
    let admin = await User.findOne({ email: 'admin@shopezz.com' });
    
    if (admin) {
      admin.password = 'password123';
      await admin.save();
      console.log('Admin already existed! Password has been reset to: password123');
      console.log('Email: admin@shopezz.com');
    } else {
      // Create a new admin user
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@shopezz.com',
        password: 'password123', // Model hook will hash this
        role: 'admin'
      });
      console.log('Admin user created successfully!');
      console.log('Email: admin@shopezz.com');
      console.log('Password: password123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
