const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001; // Backend container listens on this port

// --- MONGODB ATLAS CONNECTION CONFIGURATION ---
// These variables are injected securely via Kubernetes Secrets and ConfigMaps.
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

// Check if all required environment variables are present before attempting connection
if (!MONGO_USER || !MONGO_PASS || !MONGO_HOST || !MONGO_DB_NAME) {
    console.error("FATAL ERROR: Required MongoDB environment variables are missing.");
    // In a production environment, you would log an error and exit.
}

// Construct the full URI using the injected variables
const MONGO_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DB_NAME}?appName=${MONGO_DB_NAME}&retryWrites=true&w=majority`;

let isDbConnected = false;

// Function to establish a connection to the MongoDB Atlas instance
const connectToDatabase = async () => {
    if (!MONGO_USER) {
        console.error("Skipping DB connection: MongoDB credentials not set.");
        return;
    }
    try {
        console.log(`Attempting to connect to MongoDB Atlas host: ${MONGO_HOST}`);
        
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, 
            dbName: MONGO_DB_NAME, 
        });
        
        isDbConnected = true;
        console.log("Successfully connected to MongoDB Atlas.");
        
    } catch (error) {
        console.error("ERROR: Failed to connect to MongoDB Atlas.", error.message);
        isDbConnected = false;
    }
};

// Define a simple Mongoose Schema and Model for demonstration
const MessageSchema = new mongoose.Schema({
    text: String,
    timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', MessageSchema);


// Initiate the database connection
connectToDatabase();

app.use(express.json());

// API Route for demonstration purposes
app.get('/api/public-message', async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ 
            error: "Service Unavailable: MongoDB connection failed or not ready."
        });
    }

    try {
        // Find the latest message or create one if none exists
        let latestMessage = await Message.findOne({}).sort({ timestamp: -1 });

        if (!latestMessage) {
            latestMessage = await Message.create({
                text: "Welcome! This message was retrieved from MongoDB Atlas.",
            });
        }
        
        res.json({
            status: 'success',
            message: latestMessage.text,
            source: `MongoDB Atlas Cluster (${MONGO_DB_NAME})`,
            timestamp: latestMessage.timestamp
        });

    } catch (error) {
        console.error("Error executing MongoDB query:", error);
        res.status(500).json({ error: "Failed to fetch data from MongoDB Atlas." });
    }
});


app.listen(PORT, () => {
    console.log(`Node.js Backend running on http://localhost:${PORT}`);
    console.log("Ready to receive traffic from Kubernetes Service.");
});
