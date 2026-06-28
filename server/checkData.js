require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const productCount = await Product.countDocuments();
    console.log(`Total Products: ${productCount}`);
    
    if (productCount > 0) {
      const products = await Product.find().limit(3).select('name description isActive');
      console.log('Sample Products:');
      products.forEach(p => console.log(`- ${p.name} (Active: ${p.isActive})`));
      
      const laptopProducts = await Product.find({ $text: { $search: "laptop" } });
      console.log(`Products matching "laptop" via text search: ${laptopProducts.length}`);
    }

    const categoryCount = await Category.countDocuments();
    console.log(`Total Categories: ${categoryCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkData();
