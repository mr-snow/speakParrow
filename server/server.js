const express = require('express');
require('dotenv').config();
const chalk = require('chalk');
const db = require('./db');
const cors = require('cors'); 

const app = express();

app.use(cors());
app.use(express.json());

const routes = require('./routes/index');
app.use('/api/', routes);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(chalk.green.bold(`🚀 Server is running on port ${PORT}...`));
});
