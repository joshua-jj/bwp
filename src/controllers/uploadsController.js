const db = require('../db/connect');
const { unlinkSync } = require('fs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');
const cloudinary = require('cloudinary').v2;

const uploadOperatorPhoto = async (req, res) => {
  const { email } = req.user;
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

const uploadFieldOfficerGovId = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError('Please provide all fields.');

  const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  if (!regexEmail.test(email)) {
    throw new BadRequestError('Please provide a valid email');
  }

  let queryFieldOfficerEmail = `SELECT * FROM field_officers_government_id_images WHERE email='${email}'`;
  let [resultEmail] = await db.query(queryFieldOfficerEmail);

  if (resultEmail.length) throw new BadRequestError('Email already exists.');

  if (!req.files) throw new BadRequestError('No file uploaded');
  const governmentId = req.files.image;
  if (!governmentId.mimetype.startsWith('image')) {
    throw new BadRequestError('Please upload an image');
  }

  const maxFileSize = process.env.MAX_FILE_SIZE / (1024 * 1024);

  // Check if image size limit is exceeded
  if (governmentId.size > process.env.MAX_FILE_SIZE) {
    throw new BadRequestError(`Image should not be more than ${maxFileSize}MB`);
  }

  const { tempFilePath } = governmentId;
   const { secure_url: secureUrl } = await cloudinary.uploader.upload(
     tempFilePath,
     {
       use_filename: true,
       folder: 'BWP/Field Officers Gov ID/',
     }
   );
  unlinkSync(tempFilePath);

  let queryInsertId = `INSERT INTO field_officers_government_id_images (image, email) VALUES ('${secureUrl}', '${email}')`;
  await db.query(queryInsertId);

  res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, message: 'Success' });
};

module.exports = { uploadOperatorPhoto, uploadFieldOfficerGovId };
