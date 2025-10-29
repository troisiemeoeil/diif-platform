import clientPromise from "@/lib/db/mongodb";

const findSimilar = async (input) => {
    const { length, vtop } = input;
    const inputLength = length;
    const inputVTopD = vtop;

    const pipeline = [
        // Stage 1: Deconstruct the Logs array into individual documents
        {
            $unwind: "$Logs"
        },
        // Stage 2: Calculate the similarity score for each individual log
        {
            $addFields: {
                similarityScore: {
                    $add: [
                        // Length difference (input mm -> DB cm)
                        {
                            $pow: [{
                                $subtract: [
                                    { $toDouble: "$Logs.LogMeasurement.LogLength" },
                                    { $divide: [{ $toDouble: inputLength }, 10] }
                                ]
                            }, 2]
                        },
                        // Top diameter difference (input 0.1 mm -> DB mm)
                        {
                            $pow: [{
                                $subtract: [
                                    { $toDouble: "$Logs.LogMeasurement.TopOb" },
                                    { $divide: [{ $toDouble: inputVTopD }, 10] }
                                ]
                            }, 2]
                        },
                    ]
                }
            }
        },
        // --- REMOVED THE GROUPING LOGIC THAT CAUSED THE ISSUE ---
        // The $group, second $unwind, and $match stages were here.
        // By removing them, we now sort all logs, not just the best log from each stem.

        // Stage 3: Sort all logs by their similarity score in ascending order
        {
            $sort: {
                similarityScore: 1 // Sort by the score of each log
            }
        },
        // Stage 4: Limit to the top 5 best matches
        {
            $limit: 5
        },
        // Stage 5: Project the final fields
        {
            $project: {
                _id: 0,
                StemKey: "$StemKey", // Keep the original StemKey
                similarityScore: 1,  // The score for this specific log
                StemNumber: "$StemNumber",
                Latitude: "$Latitude",
                Longitude: "$Longitude",
                MatchingLog: "$Logs", // The entire log object that matched
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