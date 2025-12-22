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
    
    let dbData = [];

    try {
        const client = await clientPromise;
        const db = client.db("sawmill");
        const collection = db.collection("data");
        const document = await collection.find({}).toArray();

        if (!document || document.length === 0) {
            return NextResponse.json({ 
                data: [], 
                meta: { totalRowCount: 0 } 
            }, { status: 200 });
        }

        dbData = document;

    } catch (error) {
        console.error("Database connection or query error:", error);
        return NextResponse.json(
            { error: "Internal Server Error during data fetch" },
            { status: 500 }
        );
    }
    
    const parsedColumnFilters = JSON.parse(filters || '[]') ; 
    if (parsedColumnFilters?.length) {
        parsedColumnFilters.map((filter) => {
            const { id: columnId, value: filterValue } = filter;
            dbData = dbData.filter((row) => {
                if (!row[columnId]) return false;

                if (columnId === 'lastLogin') {
                    const rowDateValue = row[columnId] instanceof Date ? row[columnId] : new Date(row[columnId]);
                    const filterDateValue = new Date(filterValue);
                    return rowDateValue > filterDateValue;
                }
                
                return row[columnId]
                    ?.toString()
                    ?.toLowerCase()
                    ?.includes?.((filterValue || '').toLowerCase());
            });
        });
    }

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

        const objectIds = rowIds.map(id => new ObjectId(id));

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
