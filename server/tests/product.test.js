const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/db', () => jest.fn());
jest.mock('../services/productService');
jest.mock('../models/User');

const productService = require('../services/productService');
const User = require('../models/User');
const app = require('../server');

describe('Product API', () => {
  let adminToken;

  beforeAll(() => {
    adminToken = jwt.sign({ id: 'admin_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should retrieve a list of products', async () => {
      productService.getProducts.mockResolvedValue({
        products: [{ _id: '1', name: 'Product 1' }, { _id: '2', name: 'Product 2' }],
        pagination: { total: 2, page: 1, pages: 1 }
      });

      const res = await request(app).get('/api/products?page=1&limit=10');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.products.length).toBe(2);
      expect(res.body.data.pagination.total).toBe(2);
    });
  });

  describe('POST /api/products (Admin Only)', () => {
    it('should create a new product if user is admin', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'admin_id', role: 'admin' })
      });

      productService.createProduct.mockResolvedValue({ _id: 'new_id', name: 'New Product' });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          description: 'Desc',
          price: 100,
          category: 'cat_id',
          stock: 10
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.name).toEqual('New Product');
    });

    it('should fail if user is not admin', async () => {
      const userToken = jwt.sign({ id: 'user_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user_id', role: 'user' })
      });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Product' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toContain('admin');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product if admin', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'admin_id', role: 'admin' })
      });

      productService.deleteProduct.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Product deleted successfully');
    });
  });
});
