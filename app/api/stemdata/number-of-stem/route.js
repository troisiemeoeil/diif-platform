import clientPromise from "@/lib/db/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("harvesting-data");
    const collection = db.collection("harvesting-data");

    // --- Aggregation Pipeline for Counting Stems by SpeciesGroupKey ---
    const stemCountingPipeline = [
      // 1. Group the original documents by SpeciesGroupKey
      {
        $group: {
          _id: "$SpeciesGroupKey",
          // 2. Count the original documents/stems in each group
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          groupKey: "$_id",
          count: 1,
        },
      },
    ];

    const results = await collection.aggregate(stemCountingPipeline).toArray();
    const totalCount = results.reduce((sum, item) => sum + (item.count || 0), 0);

    // --- Aggregation Pipeline for Overall Log Volume Average (This pipeline still needs $unwind) ---
    const overallAvgPipeline = [
      { $unwind: "$Logs" },
      {
        $group: {
          _id: null,
          averageLogVolumeSob: { $avg: { $toDouble: "$Logs.LogVolumeSob" } },
        },
      },
      { $project: { _id: 0, averageLogVolumeSob: 1 } },
    ];

    // Safety check for empty result array
    const avgResult = await collection.aggregate(overallAvgPipeline).toArray();
    const overallAvg = avgResult.length > 0 ? avgResult[0].averageLogVolumeSob : 0;

    const overallAvgSubPipeline = [
      { $unwind: "$Logs" },
      {
        $group: {
          _id: null,
          averageLogVolumeSub: { $avg: { $toDouble: "$Logs.LogVolumeSub" } },
        },
      },
      { $project: { _id: 0, averageLogVolumeSub: 1 } },
    ];

    // Safety check for empty result array
    const avgSubResult = await collection.aggregate(overallAvgSubPipeline).toArray();
    const overallAvgSub = avgSubResult.length > 0 ? avgSubResult[0].averageLogVolumeSub : 0;


    // Define the number of logs per group
    const LOGS_PER_BUCKET = 50;

    const AveragePer100Logs = [
      // 1. Unwind the Logs array to get individual log documents
      { $unwind: "$Logs" },

      // --- Start: Sequential ID Assignment using $group / $unwind (Pre-5.0 compatible) ---
      // 2. Group ALL logs into a single array to assign a sequential ID
      {
        $group: {
          _id: null,
          allLogs: { $push: "$$ROOT" } // Push entire log document context
        }
      },
      // 3. Unwind the massive array, assigning a sequential index (0, 1, 2...)
      { $unwind: { path: "$allLogs", includeArrayIndex: "sequenceIndex" } },

      // 4. Project the necessary fields and calculate the bucket number
      {
        $project: {
          _id: 0,
          LogVolumeSob: "$allLogs.Logs.LogVolumeSob",
          LogVolumeSub: "$allLogs.Logs.LogVolumeSub",
          // Calculate the bucket number: (index) / 100, then floor, then add 1.
          bucketNumber: {
            $add: [
              1,
              {
                $floor: {
                  $divide: ["$sequenceIndex", LOGS_PER_BUCKET]
                }
              }
            ]
          }
        }
      },
      // --- End: Sequential ID Assignment ---

      // 5. Group by bucket and calculate averages
      {
        $group: {
          _id: "$bucketNumber",
          averageLogVolumeSob: { $avg: { $toDouble: "$LogVolumeSob" } },
          averageLogVolumeSub: { $avg: { $toDouble: "$LogVolumeSub" } },
          totalLogsInBucket: { $sum: 1 }
        }
      },

      // 6. Sort by bucket number
      { $sort: { _id: 1 } },

      // 7. Final projection
      {
        $project: {
          _id: 0,
          bucketNumber: "$_id",
          averageLogVolumeSob: 1,
          averageLogVolumeSub: 1,
          totalLogsInBucket: 1
        }
      }
    ];

    const AveragePer100LogsResults = await collection.aggregate(AveragePer100Logs).toArray();


    // --- Aggregation Pipeline for Average Stem Length by SpeciesGroupKey ---
    const avgStemLengthBySpeciesPipeline = [
      // 1. Unwind logs
      { $unwind: "$Logs" },

      // 2. Group by stem and species key to calculate total length per stem
      {
        $group: {
          _id: {
            stemKey: "$StemKey",
            speciesKey: "$SpeciesGroupKey"
          },
          totalStemLength: {
            $sum: { $toDouble: "$Logs.LogMeasurement.LogLength" }
          }
        }
      },

      // 3. Group by species key to calculate the average stem length for the category
      {
        $group: {
          _id: "$_id.speciesKey",
          averageStemLength: { $avg: "$totalStemLength" },
          totalStemsInGroup: { $sum: 1 }
        }
      },

      // 4. Sort results
      { $sort: { averageStemLength: -1 } },

      // 5. Final projection
      {
        $project: {
          _id: 0,
          speciesKey: "$_id",
          averageStemLength: 1,
          totalStemsInGroup: 1
        }
      }
    ];

    const averageStemLengthBySpeciesResult = await collection.aggregate(avgStemLengthBySpeciesPipeline).toArray();

    return Response.json({
      totalCount, // This is now the total number of STEMS
      countsBySpecies: results, // This is the count of STEMS per species
      averageLogVolumeSob: overallAvg,
      averageLogVolumeSub: overallAvgSub,
      averagesPer100Stems: AveragePer100LogsResults,
      averageStemLengthBySpecies: averageStemLengthBySpeciesResult,
    });


  } catch (error) {
    console.error("MongoDB Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}