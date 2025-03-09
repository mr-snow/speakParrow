const chalk = require('chalk');
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/speakParro', {})
  .then(() => {
    console.log(chalk.magenta('DB connected successfully..'));
  })
  .catch(error => {
    console.log(chalk.red('MongoDB Connection Error:'), error);
  });

module.exports = mongoose;
