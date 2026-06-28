require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database...');

    const products = await Product.find();

    for (let product of products) {
      if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
          if (img.url.includes('via.placeholder.com')) {
            // Convert 'https://via.placeholder.com/500?text=MacBook+Pro' to 'https://placehold.co/500x500/EEE/31343C?text=MacBook+Pro'
            const textMatch = img.url.match(/text=([^&]+)/);
            const text = textMatch ? textMatch[1] : product.name.replace(/\s+/g, '+');
            img.url = `https://placehold.co/500x500/EEEEEE/31343C?text=${text}`;
          }
        });
        await product.save();
      }
    }

    console.log('Images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
};

updateImages();
