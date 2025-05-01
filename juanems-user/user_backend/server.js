const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const enrolleeApplicantsRoute = require('./routes/enrolleeApplicants');
const accountRoutes = require('./routes/accountRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const strandRoutes = require('./routes/strandRoutes'); 
const roleRoutes = require('./routes/rolesRoutes'); 
const systemLogRoutes = require('./routes/systemLogRoutes'); 
const exportFile = require('./routes/exportFile');
const announcementRoutes = require('./routes/announcementRoutes');
const enrolleeApplicantDetails = require('./routes/enrolleeApplicantDetails');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    // List available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Sample data from each collection
    const results = {};
    
    for (const name of collectionNames) {
      try {
        const sampleData = await mongoose.connection.db.collection(name).find().limit(5).toArray();
        results[name] = sampleData;
      } catch (err) {
        results[name] = { error: err.message };
      }
    }
    
    res.json({
      status: "connected",
      database: mongoose.connection.db.databaseName,
      collections: collectionNames,
      sampleData: results
    });
  } catch (err) {
    res.status(500).json({ 
      status: "error", 
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }
});

// After database connection
const startAccountCleaner = require('./services/accountCleaner');
startAccountCleaner();

// Example backend verification (Node.js)
const verifyCaptcha = async (token) => {
  const secretKey = '0x4AAAAAABMiNbL8N-4SR9FfoAPqKdoJy-I';
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
    }),
  });
  return await response.json();
};

// Routes
app.use('/api/dropdown', require('./routes/dropdownRoutes'));
app.use('/api/enrollee-applicants', enrolleeApplicantsRoute);
app.use('/api/announcements', announcementRoutes);
app.use('/api/enrollee-applicants', enrolleeApplicantDetails);

// Routes (Admin)
app.use('/api/admin', accountRoutes);
app.use('/api/admin/export', exportFile);
app.use('/api/admin/subjects', subjectRoutes);
app.use('/api/admin/sections', sectionRoutes);
app.use('/api/admin/strands', strandRoutes);
app.use('/api/admin/roles', roleRoutes);
app.use('/api/admin/system-logs', systemLogRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

// Start server after DB connection
async function startServer() {
  await connectDB(); // Wait for DB connection
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
}); 

