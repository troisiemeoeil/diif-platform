import clientPromise from "@/lib/db/mongodb";

const findMatchingSawmillLogs = async (harvestLog) => {
  const { LogLength, TopOb } = harvestLog;
  const pipeline = [
    {
      $addFields: {
        similarityScore: {
          $add: [
            // --- LENGTH (Input cm -> mm) ---
            {
              $pow: [{
                $subtract: [
                  // DB Length is already in mm
                  { $toDouble: "$Length" },
                  // Convert Input LogLength from cm to mm
                  { $multiply: [{ $toDouble: LogLength }, 10] }
                ]
              }, 2]
            },
            // --- TOP DIAMETER (DB 0.1 mm -> mm) ---
            {
              $pow: [{
                $subtract: [
                  // Convert DB TRgRvc from 0.1 mm to mm
                  { $divide: [{ $toDouble: "$TRgRvc" }, 10] },
                  // Input TopOb is already in mm
                  { $toDouble: TopOb }
                ]
              }, 2]
            },
          ]
        }
      }
    },
    { $sort: { similarityScore: 1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        LogNr: 1,
        Region: 1,
        Species: 1,
        Length: 1,
        Volume: 1,
        VTopD: 1,
        VMidD: 1,
        VButD: 1,
        TRgRvc: 1,
        similarityScore: 1
      }
    }
  ];

  try {
    const client = await clientPromise;
    const db = client.db("sawmill");
    const collection = db.collection("data");

    const results = await collection.aggregate(pipeline).toArray();
    return results;
  } catch (error) {
    console.error("MongoDB Aggregation Error:", error);
    throw new Error("Failed to find matching sawmill logs.");
  }
};

// --- API Endpoint ---
export async function POST(request) {
  try {
    const input = await request.json(); // expected: { LogLength, TopOb }

    const matches = await findMatchingSawmillLogs(input);

    return new Response(JSON.stringify(matches), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("API Error in POST /api/find-matching-sawmill:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}