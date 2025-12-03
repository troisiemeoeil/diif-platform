import clientPromise from "@/lib/db/mongodb";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const stemKey = searchParams.get("stemKey");
        console.log("query: " , stemKey, typeof(stemKey));
        
        if (!stemKey) {
            return Response.json({ error: "stem key is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("harvesting-data");
        const collection = db.collection("harvesting-data");

        // Make sure we query with the correct type
        const document = await collection.findOne({ StemKey: stemKey });

        if (!document) {
            return Response.json({ error: "Not found" }, { status: 404 });
        }

        return Response.json(document);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}