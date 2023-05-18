const { unlinkSync } = require('fs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');
const cloudinary = require('cloudinary').v2;

const uploadOperatorPhoto = async (req, res) => {
  const { role } = req.user;

  if (role !== 'operator') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  if (!req.files) throw new BadRequestError('No file uploaded');
  const profilePhoto = req.files.image;
  if (!profilePhoto.mimetype.startsWith('image')) {
    throw new BadRequestError('Please upload an image');
  }
  const maxFileSize = process.env.MAX_FILE_SIZE / (1024 * 1024);

  // Check if image size limit is exceeded
  if (profilePhoto.size > process.env.MAX_FILE_SIZE) {
    throw new BadRequestError(`Photo should not be more than ${maxFileSize}MB`);
  }
  const { tempFilePath } = profilePhoto;
  const result = await cloudinary.uploader.upload(tempFilePath, {
    use_filename: true,
    folder: 'BWP/Operators Photos/',
  });
  unlinkSync(tempFilePath);
  res.status(StatusCodes.OK).json({ Photo: result.secure_url });
};

module.exports = { uploadOperatorPhoto };
