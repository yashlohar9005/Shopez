require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database for seeding...');

    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();
    console.log('Cleared existing products and categories.');

    // Create Categories
    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Gadgets and electronic devices',
      isActive: true,
    });

    const clothing = await Category.create({
      name: 'Clothing',
      description: 'Men and Women apparel',
      isActive: true,
    });

    const accessories = await Category.create({
      name: 'Accessories',
      description: 'Fashion and tech accessories',
      isActive: true,
    });

    const homeKitchen = await Category.create({
      name: 'Home & Kitchen',
      description: 'Smart home appliances and kitchen essentials',
      isActive: true,
    });

    const beautyGrooming = await Category.create({
      name: 'Beauty & Grooming',
      description: 'Skincare, hair care, and personal grooming tools',
      isActive: true,
    });

    console.log('Categories seeded.');

    // Create Products
    await Product.create([
      {
        name: 'Apple MacBook Pro 14"',
        description: 'Powerful laptop with M2 Pro chip, 16GB RAM, 512GB SSD.',
        price: 230000,
        stock: 10,
        category: electronics._id,
        brand: 'Apple',
        isActive: true,
        images: [{ publicId: 'sample1', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' }],
        specifications: [
          { name: 'CPU', value: 'Apple M2 Pro (10-core)' },
          { name: 'RAM', value: '16GB Unified Memory' },
          { name: 'Storage', value: '512GB SSD' },
          { name: 'Display', value: '14.2-inch Liquid Retina XDR' },
          { name: 'OS', value: 'macOS Ventura' }
        ]
      },
      {
        name: 'Dell XPS 15 Laptop',
        description: 'High-performance Windows laptop with Intel Core i7 and RTX 4050.',
        price: 1749.50,
        stock: 15,
        category: electronics._id,
        brand: 'Dell',
        isActive: true,
        images: [{ publicId: 'sample2', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80' }],
        specifications: [
          { name: 'CPU', value: 'Intel Core i7-13700H (14-core)' },
          { name: 'RAM', value: '16GB DDR5 Dual Channel' },
          { name: 'Storage', value: '1TB NVMe PCIe Gen4 SSD' },
          { name: 'GPU', value: 'NVIDIA GeForce RTX 4050 (6GB GDDR6)' },
          { name: 'OS', value: 'Windows 11 Home' }
        ]
      },
      {
        name: 'Samsung Galaxy S23 Ultra',
        description: 'Premium smartphone with 200MP camera and S-Pen support.',
        price: 1199.00,
        stock: 20,
        category: electronics._id,
        brand: 'Samsung',
        isActive: true,
        images: [{ publicId: 'sample3', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80' }],
        specifications: [
          { name: 'Display', value: '6.8-inch Dynamic AMOLED 2X (120Hz)' },
          { name: 'Processor', value: 'Snapdragon 8 Gen 2 for Galaxy' },
          { name: 'RAM', value: '12GB LPDDR5X' },
          { name: 'Storage', value: '256GB UFS 4.0' },
          { name: 'Main Camera', value: '200MP + 10MP + 10MP + 12MP' },
          { name: 'Battery', value: '5000 mAh' }
        ]
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling wireless headphones.',
        price: 25000,
        stock: 30,
        category: electronics._id,
        brand: 'Sony',
        isActive: true,
        images: [{ publicId: 'sample4', url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80' }],
        specifications: [
          { name: 'Type', value: 'Over-Ear' },
          { name: 'Connectivity', value: 'Bluetooth 5.2 & Wired' },
          { name: 'Battery Life', value: 'Up to 30 hours' },
          { name: 'Noise Cancelling', value: 'Yes (Active Noise Cancellation)' },
          { name: 'Drivers', value: '30mm dynamic dome' }
        ]
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable and stylish running shoes for everyday wear.',
        price: 150.00,
        stock: 50,
        category: clothing._id,
        brand: 'Nike',
        isActive: true,
        images: [{ publicId: 'sample5', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }],
        specifications: [
          { name: 'Material', value: 'Breathable Mesh & Synthetic' },
          { name: 'Sole', value: 'Rubber sole with Max Air unit' },
          { name: 'Closure', value: 'Lace-up' },
          { name: 'Weight', value: '310g per shoe' }
        ]
      },
      {
        name: 'Adidas Ultraboost',
        description: 'High-performance running shoes with responsive cushioning.',
        price: 180.00,
        stock: 45,
        category: clothing._id,
        brand: 'Adidas',
        isActive: true,
        images: [{ publicId: 'sample6', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80' }],
        specifications: [
          { name: 'Material', value: 'Primeknit Textile Upper' },
          { name: 'Midsole', value: 'Boost responsive cushioning' },
          { name: 'Outsole', value: 'Continental Rubber Outsole' },
          { name: 'Arch Type', value: 'Normal / Medium' }
        ]
      },
      {
        name: "Levi's Men's 501 Original Fit Jeans",
        description: 'Classic straight leg jeans with iconic button fly.',
        price: 59.99,
        stock: 100,
        category: clothing._id,
        brand: "Levi's",
        isActive: true,
        images: [{ publicId: 'sample7', url: 'https://images.unsplash.com/photo-1542272604-78ec9a86b110?w=500&q=80' }],
        specifications: [
          { name: 'Material', value: '100% Cotton non-stretch denim' },
          { name: 'Fit', value: 'Regular fit through seat and thigh' },
          { name: 'Leg Shape', value: 'Straight leg' },
          { name: 'Fly Type', value: 'Button fly' }
        ]
      },
      {
        name: 'Ray-Ban Classic Aviator Sunglasses',
        description: 'Timeless style with polarized lenses for ultimate protection.',
        price: 163.00,
        stock: 25,
        category: accessories._id,
        brand: 'Ray-Ban',
        isActive: true,
        images: [{ publicId: 'sample8', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80' }],
        specifications: [
          { name: 'Frame Material', value: 'Polished Metal (Gold)' },
          { name: 'Lens Technology', value: 'Polarized G-15 (Green)' },
          { name: 'Bridge Width', value: '14 mm' },
          { name: 'Temple Length', value: '135 mm' }
        ]
      },
      {
        name: 'Apple Watch Series 9',
        description: 'Advanced health tracking and always-on retina display.',
        price: 399.00,
        stock: 40,
        category: accessories._id,
        brand: 'Apple',
        isActive: true,
        images: [{ publicId: 'sample9', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80' }],
        specifications: [
          { name: 'Case Size', value: '41mm or 45mm' },
          { name: 'Display', value: 'Always-On Retina (Up to 2000 nits)' },
          { name: 'Chip', value: 'S9 SiP' },
          { name: 'Water Resistance', value: 'Swimproof (50m)' },
          { name: 'Sensors', value: 'Blood Oxygen, ECG, Temperature, Sleep' }
        ]
      },
      {
        name: 'Samsung 4K Smart TV',
        description: '55-inch 4K UHD Smart TV with vibrant colors and smart features.',
        price: 499.99,
        stock: 12,
        category: electronics._id,
        brand: 'Samsung',
        isActive: true,
        images: [{ publicId: 'sample10', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80' }],
        specifications: [
          { name: 'Screen Size', value: '55 Inches' },
          { name: 'Resolution', value: '4K Ultra HD (3840 x 2160)' },
          { name: 'Display Tech', value: 'LED / Crystal UHD' },
          { name: 'Refresh Rate', value: '60 Hz' },
          { name: 'HDMI Ports', value: '3 Ports' }
        ]
      },
      {
        name: 'Dyson V15 Detect Vacuum',
        description: 'Intelligent cordless vacuum with laser illumination.',
        price: 749.99,
        stock: 8,
        category: homeKitchen._id,
        brand: 'Dyson',
        isActive: true,
        images: [{ publicId: 'sample11', url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80' }],
        specifications: [
          { name: 'Type', value: 'Cordless Stick Vacuum' },
          { name: 'Suction Power', value: '230 AW' },
          { name: 'Run Time', value: 'Up to 60 minutes' },
          { name: 'Bin Volume', value: '0.2 gallons' },
          { name: 'Weight', value: '3.1 kg' }
        ]
      },
      {
        name: 'Instant Pot Duo Plus 9-in-1',
        description: 'Versatile electric pressure cooker and multi-cooker.',
        price: 129.99,
        stock: 22,
        category: homeKitchen._id,
        brand: 'Instant Pot',
        isActive: true,
        images: [{ publicId: 'sample12', url: 'https://images.unsplash.com/photo-1585672841968-3de32ad97c55?w=500&q=80' }],
        specifications: [
          { name: 'Capacity', value: '6 Quarts' },
          { name: 'Programs', value: '15 One-Touch Programs' },
          { name: 'Material', value: 'Stainless Steel' },
          { name: 'Power', value: '1000 W' }
        ]
      },
      {
        name: 'Philips Sonicare ProtectiveClean 5100',
        description: 'Electric toothbrush with pressure sensor for healthier gums.',
        price: 99.99,
        stock: 35,
        category: beautyGrooming._id,
        brand: 'Philips',
        isActive: true,
        images: [{ publicId: 'sample13', url: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=500&q=80' }],
        specifications: [
          { name: 'Brush Speed', value: 'Up to 62,000 brush movements/min' },
          { name: 'Modes', value: 'Clean, White, Gum Care' },
          { name: 'Battery Life', value: 'Up to 2 weeks' },
          { name: 'Included Accessories', value: '1 ProtectiveClean handle, 1 G2 Optimal Gum Care brush head, 1 Travel case' }
        ]
      },
      {
        name: 'Fitbit Charge 6',
        description: 'Advanced fitness and health tracker with built-in GPS.',
        price: 159.95,
        stock: 28,
        category: accessories._id,
        brand: 'Fitbit',
        isActive: true,
        images: [{ publicId: 'sample14', url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80' }],
        specifications: [
          { name: 'Sensors', value: 'GPS, Heart Rate, SpO2, EDA Scan, Skin Temp' },
          { name: 'Battery', value: 'Up to 7 days' },
          { name: 'Water Resistance', value: 'Water-resistant up to 50 meters' },
          { name: 'Compatibility', value: 'iOS and Android' }
        ]
      },
      {
        name: "Zara Men's Slim Fit Shirt",
        description: 'Classic cotton button-down shirt with a modern slim fit.',
        price: 49.99,
        stock: 60,
        category: clothing._id,
        brand: 'Zara',
        isActive: true,
        images: [{ publicId: 'sample15', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80' }],
        specifications: [
          { name: 'Material', value: '100% Cotton' },
          { name: 'Fit', value: 'Slim Fit' },
          { name: 'Sleeve', value: 'Long Sleeve' },
          { name: 'Care Instructions', value: 'Machine wash warm, tumble dry low' }
        ]
      },
      {
        name: "H&M Women's Floral Summer Dress",
        description: 'Lightweight and flowy V-neck dress with a beautiful floral print.',
        price: 39.99,
        stock: 40,
        category: clothing._id,
        brand: 'H&M',
        isActive: true,
        images: [{ publicId: 'sample16', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80' }],
        specifications: [
          { name: 'Material', value: '100% Polyester' },
          { name: 'Length', value: 'Midi' },
          { name: 'Neckline', value: 'V-neck' },
          { name: 'Pattern', value: 'Floral' }
        ]
      },
      {
        name: "North Face Men's Waterproof Jacket",
        description: 'Durable, waterproof, and windproof jacket for outdoor adventures.',
        price: 199.00,
        stock: 15,
        category: clothing._id,
        brand: 'The North Face',
        isActive: true,
        images: [{ publicId: 'sample17', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&q=80' }],
        specifications: [
          { name: 'Material', value: 'DryVent 2L Nylon' },
          { name: 'Waterproof', value: 'Yes (Seam-sealed)' },
          { name: 'Windproof', value: 'Yes' },
          { name: 'Weight', value: '490g' }
        ]
      }
    ]);
    console.log('Products seeded.');

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
