import clientPromise from "@/lib/db/mongodb";

const findSimilar = async (input) => {
    const { length, vtop } = input;
    const inputLength = length;
    const inputVTopD = vtop;
 //equation : Similarity Score = (Length diff)^2 + (Diameter diff )^2
    const pipeline = [
        {
            $unwind: "$Logs"
        },
        {
            $addFields: {
                similarityScore: {
                    $add: [
                        {
                            $pow: [{
                                $subtract: [
                                    { $multiply: [{$toDouble:  "$Logs.LogMeasurement.LogLength" } , 10] },
                             inputLength 
                                ]
                            }, 2]
                        },
                        {
                            $pow: [{
                                $subtract: [
                                   {$toDouble: "$Logs.LogMeasurement.TopOb" },
                                    { $divide: [ inputVTopD, 10] }
                                ]
                            }, 2]
                        },
                    ]
                }
            }
        },
       

        {
            $sort: {
                similarityScore: 1 
            }
        },
        {
            $limit: 5
        },
        {
            $project: {
                _id: 0,
                StemKey: "$StemKey", 
                similarityScore: 1,  
                StemNumber: "$StemNumber",
                Latitude: "$Latitude",
                Longitude: "$Longitude",
                MatchingLog: "$Logs",
            }
        }
    ];

    try {
        const client = await clientPromise;
        const db = client.db("harvesting-data");
        const collection = db.collection("harvesting-data");
        const results = await collection.aggregate(pipeline).toArray();
        return results;
    } catch (error) {
        console.error("MongoDB Aggregation Error:", error);
        throw new Error("Failed to find similar documents.");
    }
};

export async function POST(request) {
    try {
        const input = await request.json();

        const matches = await findSimilar(input);

        return new Response(JSON.stringify(matches), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        console.error("API Error in POST /api/find-similar:", e);
        return new Response(JSON.stringify({ error: e.message || "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
