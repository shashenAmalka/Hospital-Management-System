const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Ensure dotenv is loaded at the top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const userRoutes = require('./Route/UserRoutes');
const authRoutes = require('./Route/AuthRoutes');

app.use(cors()); // Add CORS middleware
app.use(express.json()); // Middleware to parse JSON
app.use("/users", userRoutes);
app.use("/auth", authRoutes); // Add this line

// Debugging: Log all environment variables
console.log("Environment Variables:", process.env);
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

// Debug JWT_SECRET
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const mongoUri = process.env.MONGO_URI || "mongodb+srv://shashenwebdevelopment:IfkVXb5QfNj0FRiQ@cluster0.wualzcm.mongodb.net/mydb";
console.log("Using MongoDB URI:", mongoUri);

// Add debug logging for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.log(err));