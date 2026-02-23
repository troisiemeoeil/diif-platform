import getMongoConnection from "@/lib/db/mongodb";

export async function GET() {
  try {
    const client = await getMongoConnection();
    const db = client.db("harvesting-data");
    const collection = db.collection("harvesting-data");

    const documents = await collection.find({}).toArray();

    return Response.json(documents);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
