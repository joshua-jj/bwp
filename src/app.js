require('dotenv').config();
require('express-async-errors');

const express = require('express');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const authRouter = require('./routes/authRoutes');
const productsRouter = require('./routes/productsRoutes');
const usersRouter = require('./routes/usersRoutes');
const fieldOfficersRouter = require('./routes/fieldOfficersRoutes');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');
const app = express();

const port = process.env.PORT || 5000;

//~ middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: true }));

app.use('/api/v1', authRouter);
app.use('/api/v1', usersRouter);
app.use('/api/v1', productsRouter);
app.use('/api/v1', fieldOfficersRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
