const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock dependencies before importing the app
jest.mock('../config/db', () => jest.fn());
jest.mock('../models/User');

const User = require('../models/User');
const app = require('../server');

describe('Authentication API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      User.findOne.mockResolvedValue(null);
      // Mock User.create to return a mock user object
      const mockUser = {
        _id: 'mock_user_id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };
      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.user.email).toEqual('test@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail if email is already registered', async () => {
      // Mock User.findOne to return an existing user
      User.findOne.mockResolvedValue({ _id: 'existing_id' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toContain('User already exists');
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBeFalsy();
      expect(res.body.errors).toBeDefined(); // Express validator errors
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user with correct credentials', async () => {
      const mockUser = {
        _id: 'mock_user_id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        matchPassword: jest.fn().mockResolvedValue(true)
      };

      // Ensure select('+password') is chained correctly
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const mockUser = {
        _id: 'mock_user_id',
        matchPassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile (Protected Route)', () => {
    it('should access profile with valid token', async () => {
      const token = jwt.sign({ id: 'mock_user_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      
      const mockUser = {
        _id: 'mock_user_id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.name).toEqual('Test User');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toContain('Not authorized');
    });
  });
});
