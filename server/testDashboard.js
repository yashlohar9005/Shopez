const mongoose = require('mongoose');
const customerService = require('./services/customerService');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopezz')
  .then(async () => {
    console.log('Connected to DB');
    try {
      const User = require('./models/User');
      const user = await User.findOne(); // Get any user
      if (!user) {
        console.log('No user found');
        process.exit(0);
      }
      console.log('Testing for user:', user._id, typeof user._id);
      
      const summary = await customerService.getDashboardSummary(user._id);
      console.log('Summary:', summary);
    } catch (err) {
      console.error('ERROR:', err);
    }
    process.exit(0);
  });
