import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10, // Set a maximum pool size
  minPoolSize: 5    // Maintain minimum connections
};

let client;
let clientPromise;
let dbInstance = null; 

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Add the connectToDatabase function for API routes
export async function connectToDatabase() {
  try {
    
    if (dbInstance) {
      return dbInstance;
    }
    
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'MoldInBeehives';
    dbInstance = client.db(dbName);
    
    // Only log on first connection
    if (process.env.NODE_ENV === 'development') {
      console.log(`MongoDB connection pool established for database: ${dbName}`);
    }
    
    return dbInstance;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default clientPromise; 