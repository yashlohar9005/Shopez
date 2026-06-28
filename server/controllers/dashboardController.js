/**
 * @file backend/controllers/dashboardController.js
 * @description Controller for Live Dashboard endpoints.
 */

const dashboardService = require('../services/dashboardService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.status(200).json(new ApiResponse(200, data, 'Summary retrieved'));
});

exports.getRevenue = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenue();
  res.status(200).json(new ApiResponse(200, data, 'Revenue retrieved'));
});

exports.getOrders = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOrders();
  res.status(200).json(new ApiResponse(200, data, 'Orders retrieved'));
});

exports.getProducts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getProducts();
  res.status(200).json(new ApiResponse(200, data, 'Products retrieved'));
});

exports.getCustomers = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCustomers();
  res.status(200).json(new ApiResponse(200, data, 'Customers retrieved'));
});

exports.getActivity = asyncHandler(async (req, res) => {
  const data = await dashboardService.getActivity();
  res.status(200).json(new ApiResponse(200, data, 'Activity retrieved'));
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAnalytics();
  res.status(200).json(new ApiResponse(200, data, 'Analytics retrieved'));
});

exports.getInventory = asyncHandler(async (req, res) => {
  const data = await dashboardService.getInventory();
  res.status(200).json(new ApiResponse(200, data, 'Inventory retrieved'));
});
