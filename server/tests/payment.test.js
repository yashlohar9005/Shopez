const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

jest.mock('../config/db', () => jest.fn());
jest.mock('../config/razorpay', () => ({
  orders: {
    create: jest.fn()
  }
}));
jest.mock('../models/Order');
jest.mock('../models/User');

const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const User = require('../models/User');
const app = require('../server');

describe('Payment API', () => {
  let userToken;

  beforeAll(() => {
    userToken = jwt.sign({ id: 'user_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payment/create-order', () => {
    it('should create a Razorpay order', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user_id', role: 'user' })
      });

      const mockOrder = {
        _id: 'order_1',
        user: 'user_id',
        totalPrice: 500,
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      Order.findById.mockResolvedValue(mockOrder);

      razorpayInstance.orders.create.mockResolvedValue({
        id: 'rzp_order_123',
        amount: 50000,
        currency: 'INR'
      });

      const res = await request(app)
        .post('/api/payment/create-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderId: '507f1f77bcf86cd799439011' }); // Use valid mongo id format

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.id).toEqual('rzp_order_123');
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/payment/verify', () => {
    it('should verify correct signature', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user_id', role: 'user' })
      });

      const mockOrder = {
        _id: 'order_1',
        markAsPaid: jest.fn().mockResolvedValue(true)
      };
      Order.findById.mockResolvedValue(mockOrder);

      const razorpay_order_id = 'rzp_order_123';
      const razorpay_payment_id = 'rzp_payment_123';
      
      const expectedSignature = crypto
        .createHmac('sha256', 'test_secret')
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: '507f1f77bcf86cd799439011',
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature: expectedSignature
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.verified).toBeTruthy();
      expect(mockOrder.markAsPaid).toHaveBeenCalledWith(razorpay_payment_id, expectedSignature);
    });

    it('should fail with invalid signature', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user_id', role: 'user' })
      });

      const mockOrder = {
        _id: 'order_1',
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: '507f1f77bcf86cd799439011',
          razorpay_order_id: 'rzp_order_123',
          razorpay_payment_id: 'rzp_payment_123',
          razorpay_signature: 'invalid_signature_hash'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Invalid payment signature');
    });
  });
});
