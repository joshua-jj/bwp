const db = require('../db/connect');
const { unlinkSync } = require('fs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');
const cloudinary = require('cloudinary').v2;

const uploadOperatorPhoto = async (req, res) => {
  const { email } = req.user;
  console.log(email);
  if (!req.files) throw new BadRequestError('No file uploaded');
  const profilePhoto = req.files.image;
  if (!profilePhoto.mimetype.startsWith('image')) {
    throw new BadRequestError('Please upload an image');
  }
  const maxFileSize = process.env.MAX_FILE_SIZE / (1024 * 1024);

  // Check if image size limit is exceeded

  let queryOperator = `SELECT * FROM users WHERE email='${email}'`;
  let [[{ id: userId }]] = await db.query(queryOperator);

  if (profilePhoto.size > process.env.MAX_FILE_SIZE) {
    throw new BadRequestError(`Image should not be more than ${maxFileSize}MB`);
  }
  const { tempFilePath } = profilePhoto;
  const { secure_url: secureUrl } = await cloudinary.uploader.upload(
    tempFilePath,
    {
      use_filename: true,
      folder: 'BWP/Operators Photos/',
    }
  );
  unlinkSync(tempFilePath);

  let queryInsertPhoto = `INSERT INTO operators_photos (photo, user_id) VALUES ('${secureUrl}', ${userId})`;
  await db.query(queryInsertPhoto);

  res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, message: 'Success' });
};

const uploadImage = async (req, res) => {
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
    throw new BadRequestError(`Image should not be more than ${maxFileSize}MB`);
  }
  const { tempFilePath } = profilePhoto;
  const result = await cloudinary.uploader.upload(tempFilePath, {
    use_filename: true,
    folder: 'BWP/Images/',
  });
  unlinkSync(tempFilePath);
  res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, Photo: result.secure_url });
};

module.exports = { uploadOperatorPhoto, uploadImage };
