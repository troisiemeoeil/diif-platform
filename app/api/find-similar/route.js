import clientPromise from "@/lib/db/mongodb";

const findSimilar = async (input) => {
    const { length, vtop } = input;
    const inputLength = length;
    const inputVTopD = vtop; 

    const pipeline = [
        {
            $unwind: "$Logs"
        },
        {
            $addFields: {
                similarityScore: {
                    $add: [
                        // --- LENGTH CONVERSION ---
                        // CSV Input (mm) needs to be converted to DB Unit (cm). 1 cm = 10 mm.
                        // (DB LogLength (cm) - (Input Length (mm) / 10))^2
                        {
                            $pow: [{
                                $subtract: [
                                    { $toDouble: "$Logs.LogMeasurement.LogLength" }, // convert value to double type data
                                    { $divide: [{ $toDouble: inputLength }, 10] }  // Input is in mm, convert to cm
                                ]
                            }, 2]
                        },

                        // CSV Input (0.1 mm) needs to be converted to DB Unit (mm). 1 mm = 10 * (0.1 mm).
                        // (DB TopOb (mm) - (Input TRgRvc (0.1 mm) / 10))^2
                        {
                            $pow: [{
                                $subtract: [
                                    { $toDouble: "$Logs.LogMeasurement.TopOb" }, // convert value to double type data
                                    { $divide: [{ $toDouble: inputVTopD }, 10] } // Input is in 0.1 mm, convert to mm
                                ]
                            }, 2]
                        },

                    ]
                }
            }
        },
        {
            $group: {
                _id: "$StemKey",
                minSimilarityScore: { $min: "$similarityScore" },
                allLogData: {
                    $push: {
                        score: "$similarityScore",
                        log: "$Logs",
                        StemNumber: "$StemNumber",
                        Latitude: "$Latitude",
                        Longitude: "$Longitude",
                    }
                }
            }
        },
        {
            $unwind: "$allLogData"
        },
        {
            $match: {
                $expr: { $eq: ["$minSimilarityScore", "$allLogData.score"] }
            }
        },
        {
            $sort: {
                minSimilarityScore: 1
            }
        },
        {
            $limit: 5
        },
        {
            $project: {
                _id: 0,
                StemKey: "$_id",
                minSimilarityScore: 1,
                StemNumber: "$allLogData.StemNumber",
                Latitude: "$allLogData.Latitude",
                Longitude: "$allLogData.Longitude",
                BestMatchingLog: "$allLogData.log",
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