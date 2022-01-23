const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: './config.env'
});
const app = require('./app');

// console.log(process.env.MONGODB_LOCALE);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`App running on port ${port}....`));
