const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: './config.env'
});
const app = require('./app');

// console.log(process.env.MONGODB_LOCALE);

mongoose
  .connect(process.env.MONGODB_LOCALE)
  .then(() => console.log('DB connection successfully'));

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`App running on port ${port}....`));
