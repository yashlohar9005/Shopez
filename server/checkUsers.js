require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const emails = [
      'yashhhh123@gmail.com',
      'yash1234@gmail.com',
      'urmi123@gmail.com',
      'yashprofiletest@example.com',
      'testuser4@example.com',
      'yash@gmail.com',
      'yash123@gmail.com'
    ];

    const users = await User.find({ email: { $in: emails } });
    console.log('Found users in DB:', users.map(u => ({ email: u.email, id: u._id })));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
