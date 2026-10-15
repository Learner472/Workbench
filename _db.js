const { MongoClient } = require("mongodb");
let client;
module.exports = async function collection() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set in Vercel Environment Variables");
  if (!client) client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  return client.db(process.env.MONGODB_DB || "workbench").collection("state");
};
