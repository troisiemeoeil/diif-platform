import { NextResponse } from 'next/server';
// 🎯 Using the actual import for clientPromise as requested
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from 'mongodb';

export async function GET(request) {
    if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const { searchParams } = new URL(request.url);

    // Table Query Parameters
    const start = searchParams.get('start');
    const size = searchParams.get('size');
    const filters = searchParams.get('filters');
    const sorting = searchParams.get('sorting');
    const globalFilter = searchParams.get('globalFilter');
    
    // Custom Parameter (stemKey removed as we are fetching all data)
    // const stemKey = searchParams.get("stemKey"); // No longer needed

    let dbData = [];

    try {
        const client = await clientPromise;
        const db = client.db("sawmill");
        const collection = db.collection("data");
        const document = await collection.find({}).toArray();

        if (!document || document.length === 0) {
            // Return an empty array if no data is found, but still successful (200)
            return NextResponse.json({ 
                data: [], 
                meta: { totalRowCount: 0 } 
            }, { status: 200 });
        }

        // Initialize dbData with the fetched documents
        dbData = document;

    } catch (error) {
        console.error("Database connection or query error:", error);
        // Added a necessary catch block for database errors
        return NextResponse.json(
            { error: "Internal Server Error during data fetch" },
            { status: 500 }
        );
    }
    
    // 1. Column Filtering
    const parsedColumnFilters = JSON.parse(filters || '[]') ; 
    if (parsedColumnFilters?.length) {
        parsedColumnFilters.map((filter) => {
            const { id: columnId, value: filterValue } = filter;
            dbData = dbData.filter((row) => {
                // Ensure row[columnId] exists and is defined
                if (!row[columnId]) return false;

                if (columnId === 'lastLogin') {
                    // Check if row[columnId] is a Date object or convert it if it's a string
                    const rowDateValue = row[columnId] instanceof Date ? row[columnId] : new Date(row[columnId]);
                    const filterDateValue = new Date(filterValue);
                    return rowDateValue > filterDateValue;
                }
                
                // General text filtering
                return row[columnId]
                    ?.toString()
                    ?.toLowerCase()
                    ?.includes?.((filterValue || '').toLowerCase());
            });
        });
    }

    // 2. Global Filtering
    const globalFilterValue = globalFilter?.toString()?.toLowerCase();
    if (globalFilterValue) {
        dbData = dbData.filter((row) =>
            Object.keys(row).some((columnId) =>
                row[columnId]
                    ?.toString()
                    ?.toLowerCase()
                    ?.includes?.(globalFilterValue),
            ),
        );
    }
    
    // 3. Sorting
    const parsedSorting = JSON.parse(sorting || '[]') ; 
    
    if (parsedSorting?.length) {
        const sort = parsedSorting[0];
        const { id, desc } = sort;
        dbData.sort((a, b) => {
            if (desc) {
                return a[id] < b[id] ? 1 : -1;
            }
            return a[id] > b[id] ? 1 : -1;
        });
    }

    // 4. Pagination
    const startInt = parseInt(start) || 0;
    const sizeInt = parseInt(size) || 10;
    
    return NextResponse.json({
        data:
            dbData?.slice(startInt, startInt + sizeInt) ?? [],
        meta: { totalRowCount: dbData.length },
    });
}

export async function POST(request) {
    try {
        const { rowIds } = await request.json();

        if (!rowIds || !Array.isArray(rowIds) || rowIds.length === 0) {
            return NextResponse.json({ error: 'rowIds are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("sawmill");
        const collection = db.collection("data");

        // Convert string IDs to MongoDB ObjectIds
        const objectIds = rowIds.map(id => new ObjectId(id));

        // Find documents that match the array of ObjectIds
        const documents = await collection.find({ _id: { $in: objectIds } }).toArray();

        return NextResponse.json(documents);

    } catch (error) {
        console.error("Error fetching selected rows:", error);
        return NextResponse.json(
            { error: "Internal Server Error during selected data fetch" },
            { status: 500 }
        );
    }
}
