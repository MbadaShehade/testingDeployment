import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  cachedClient = client;
  return client;
}

export async function POST(req) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('hiveHistory');
    const body = await req.json();
    const { hiveId, email, temperature, humidity, timestamp } = body;
    if (!hiveId || !email || (temperature == null && humidity == null)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    await collection.insertOne({
      hiveId,
      email,
      temperature,
      humidity,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('hiveHistory');
    const { searchParams } = new URL(req.url);
    const hiveId = searchParams.get('hiveId');
    const email = searchParams.get('email');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (!hiveId || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    const query = { hiveId, email };
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end) query.timestamp.$lte = new Date(end);
    }
    const data = await collection.find(query).sort({ timestamp: 1 }).toArray();
    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 