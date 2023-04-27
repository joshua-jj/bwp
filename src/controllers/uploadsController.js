const db = require('../db/connect');
const path = require('path');
const { unlinkSync } = require('fs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');
const cloudinary = require('cloudinary').v2;

const uploadPhoto = async (req, res) => {
  // const { todoID } = req.params;
  // const { userID } = req.user;

  // // Verify that todo belongs to this user
  // await verifyTodo(todoID, userID);

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
      folder: 'BWP',
    });
    unlinkSync(tempFilePath);
  res.status(StatusCodes.OK).json({ Photo: result.secure_url });
};

module.exports = { uploadPhoto };
