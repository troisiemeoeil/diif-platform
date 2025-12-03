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


    return Response.json({
      totalCount, // This is now the total number of STEMS
      countsBySpecies: results, // This is the count of STEMS per species
      averageLogVolumeSob: overallAvg,
      averageLogVolumeSub: overallAvgSub,

    });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}