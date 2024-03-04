const mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;

// Connect to the database
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Export the mongoose connection
module.exports = mongoose.connection;
