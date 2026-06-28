const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/db', () => jest.fn());
jest.mock('../services/orderService');
jest.mock('../models/User');

const orderService = require('../services/orderService');
const User = require('../models/User');
const app = require('../server');

describe('Order API', () => {
  let userToken, adminToken;
  const validShipping = {
    street: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001', country: 'India'
  };

  beforeAll(() => {
    userToken = jwt.sign({ id: 'user_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    adminToken = jwt.sign({ id: 'admin_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('should create an order successfully', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user_id', role: 'user' })
      });

      orderService.createOrder.mockResolvedValue({ _id: 'order_1', totalPrice: 200 });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddress: validShipping,
          paymentMethod: 'COD'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBeTruthy();
    });

    it('should fail if cart is empty', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user_id', role: 'user' })
      });

      orderService.createOrder.mockRejectedValue(new Error('Your cart is empty'));

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress: validShipping, paymentMethod: 'COD' });

      expect(res.statusCode).toEqual(500); // Because we mock rejected generic error
      expect(res.body.message).toContain('cart is empty');
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user_id', role: 'user' })
      });

      orderService.getUserOrders.mockResolvedValue({
        orders: [{ _id: 'order_1' }],
        pagination: { page: 1, pages: 1, total: 1 }
      });

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.orders.length).toBe(1);
    });
  });

  describe('PUT /api/orders/:id (Admin Status Update)', () => {
    it('should update order status if admin', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'admin_id', role: 'admin' })
      });

      orderService.updateOrderStatus.mockResolvedValue({ _id: 'order_1', orderStatus: 'shipped' });

      // Valid MongoID for order ID validation
      const res = await request(app)
        .put('/api/orders/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('updated successfully');
    });
  });
});
