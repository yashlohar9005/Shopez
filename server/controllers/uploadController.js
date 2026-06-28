const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Upload image(s) locally
 * @route   POST /api/upload
 * @access  Private/Admin
 */
exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files uploaded');
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  const uploadedImages = req.files.map(file => ({
    url: `${baseUrl}/uploads/${file.filename}`,
    publicId: file.filename, // Using filename as the publicId for deletion
  }));

  res.status(200).json(new ApiResponse(200, uploadedImages, 'Images uploaded successfully'));
});

/**
 * @desc    Delete image locally
 * @route   DELETE /api/upload/:publicId
 * @access  Private/Admin
 */
exports.deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw new ApiError(400, 'Image public ID is required');
  }

  const decodedPublicId = decodeURIComponent(publicId);
  const filePath = path.join(__dirname, '../uploads', decodedPublicId);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.status(200).json(new ApiResponse(200, null, 'Image deleted successfully'));
});
