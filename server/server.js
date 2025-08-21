require("dotenv").config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

console.log("open api key?", !! process.env.OPENAI_API_KEY);
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});