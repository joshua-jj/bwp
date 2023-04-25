const db = require('../db/connect');
const path = require('path');
const { unlinkSync } = require('fs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');
const cloudinary = require('cloudinary').v2;
const { verifyTodo } = require('./helperController');

const uploadTaskFile = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;

  // Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  if (!req.files) throw new BadRequestError('No file uploaded');
  const { file } = req.files;
  let taskFiles;
  file instanceof Array
    ? (taskFiles = file)
    : (taskFiles = Object.values(req.files));
  let fileLinks = [];
  const maxFileSize = process.env.MAX_FILE_SIZE / (1024 * 1024);
  if (taskFiles.length > process.env.MAX_NUMBER_OF_FILES) {
    throw new BadRequestError(
      `You cannot upload more than ${process.env.MAX_NUMBER_OF_FILES} files`
    );
  }
  for (const file of taskFiles) {
    // Check if file size limit is exceeded
    if (file.size > process.env.MAX_FILE_SIZE)
      throw new BadRequestError(`File(s) should be less than ${maxFileSize}MB`);
    const { tempFilePath } = file;
    const result = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: 'Todo App',
    });
    fileLinks.push(result.secure_url);
    unlinkSync(tempFilePath);
  }
  res.status(StatusCodes.OK).json({ fileLinks });
};

module.exports = { uploadTaskFile };
