import clientPromise from "@/lib/db/mongodb";

const SPECIES_LABELS = {
    "613": "Pine",
    "614": "Spruce",
    "615": "Birch",
    "616": "Other broadleaves",
};

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("harvesting-data");
        const collection = db.collection("harvesting-data");

        const masterPipeline = [
            { $unwind: "$Logs" },
            // 1. Get total volume per individual stem
            {
                $group: {
                    _id: { stemKey: "$StemKey", speciesKey: "$SpeciesGroupKey" },
                    totalVol: { $sum: { $toDouble: "$Logs.LogVolumeSob" } }
                }
            },
            // 2. Separate processing for Spruce vs Others
            {
                $facet: {
                    // Path A: Regular grouping for all species (Individual Stems)
                    "regularSpecies": [
                        {
                            $group: {
                                _id: "$_id.speciesKey",
                                totalSpeciesVolume: { $sum: "$totalVol" },
                                stems: { $push: { stemKey: "$_id.stemKey", volumeSob: "$totalVol" } }
                            }
                        }
                    ],
                    // Path B: Specialized Spruce Bucketing
                    "spruceAverages": [
                        { $match: { "_id.speciesKey": "614" } },
                        { $sort: { "_id.stemKey": 1 } },
                        { $group: { _id: null, stems: { $push: "$totalVol" } } },
                        { $unwind: { path: "$stems", includeArrayIndex: "idx" } },
                        {
                            $group: {
                                _id: { $floor: { $divide: ["$idx", 100] } },
                                averageVolume: { $avg: "$stems" }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ];

        const [raw] = await collection.aggregate(masterPipeline).toArray();

        // 3. Merge the data so the frontend gets exactly what it needs
        const finalData = raw.regularSpecies.map(group => {
            const speciesKey = group._id;
            return {
                speciesKey,
                speciesName: SPECIES_LABELS[speciesKey] || "Unknown",
                totalSpeciesVolume: group.totalSpeciesVolume,
                stems: speciesKey === "614" ? [] : group.stems,
                averagedBuckets: speciesKey === "614" ? raw.spruceAverages : []
            };
        });

        return Response.json(finalData);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}