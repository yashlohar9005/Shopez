require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');

const IMAGE_URL = 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80';
const IMAGE_FILENAME = 'macbook-pro-14.jpg';

const downloadImage = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
};

const updateMacbookImage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database...');

    const product = await Product.findOne({ name: /MacBook Pro 14/i });

    if (!product) {
      console.log('Product "Apple MacBook Pro 14" not found.');
      process.exit(1);
    }

    console.log(`Found product: ${product.name} (ID: ${product._id})`);

    // Download the image to uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const destPath = path.join(uploadsDir, IMAGE_FILENAME);
    console.log('Downloading MacBook Pro 14 image...');
    await downloadImage(IMAGE_URL, destPath);
    console.log(`Image saved to: ${destPath}`);

    // Update the product's image in MongoDB
    product.images = [
      {
        publicId: 'macbook-pro-14',
        url: `http://localhost:5000/uploads/${IMAGE_FILENAME}`,
      },
    ];

    await product.save();
    console.log('✅ MacBook Pro 14 image updated successfully!');
    console.log(`   New image URL: ${product.images[0].url}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating image:', error);
    process.exit(1);
  }
};

updateMacbookImage();
