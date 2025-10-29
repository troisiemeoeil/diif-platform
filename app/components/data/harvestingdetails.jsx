"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import axios from "axios";

// --- START: Helper function defined once (can be moved to a utilities file) ---
const flattenLogData = (log) => {
  if (!log) return [];

  // Destructure to separate the nested object and excluded keys
  const { LogMeasurement, StemKey, ...restOfLog } = log;

  // Combine the main log properties and the measurement properties
  const flattened = { ...restOfLog, ...LogMeasurement };
  // Convert the object to an array of {key, value} for the TableRows
  return Object.entries(flattened).map(([key, value]) => ({
    key,
    value: String(value),
  }));
};
// --- END: Helper function ---



export default function Details() {
  const sheetOpen = useAppStore((s) => s.sheetOpen);
  const setSheetOpen = useAppStore((s) => s.setSheetOpen);
  const stemKey = useAppStore((s) => s.stemKey);
  const [stemDetails, setStemDetails] = useState(null);

  useEffect(() => {
    if (!sheetOpen) return;

    async function getData() {
      try {
        const response = await axios.get(`/api/stemdata?stemKey=${stemKey}`);
        console.log(response.data);
        setStemDetails(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    getData();
  }, [sheetOpen, stemKey]);

  if (!stemDetails) return null;

  const stemInfoRaw = stemDetails;
  // Destructuring data to eliminate specific key/values
  // const { Logs, _id, Latitude, Longitude, Altitude, StemKey, SubObjectKey, ...filteredStemInfo } = stemInfoRaw;
  const { Logs, _id, Altitude, StemKey, SubObjectKey, ...filteredStemInfo } = stemInfoRaw;


  const transformedData = Object.entries(filteredStemInfo).map(([key, value]) => ({
    key,
    value: String(value),
  }));



  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>Detailed Information</DialogTitle>
          <DialogDescription>Stem Key: {stemKey}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="stemInfo" className="w-full items-center">
          <TabsList>
            <TabsTrigger value="stemInfo">Stem Information</TabsTrigger>
            <TabsTrigger value="logs">Stem Logs</TabsTrigger>
          </TabsList>

          {/* Stem Info Tab */}
          <TabsContent value="stemInfo" className="w-[80%]">
            <Table>
              <TableHeader>
                <TableRow className="text-center">
                  <TableHead className="w-[50%] font-bold">Property</TableHead>
                  <TableHead className="w-[50%] font-bold">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody >
                {transformedData.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                      {item.key}
                    </TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <StemLogsTable stemDetails={stemDetails} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// =======================================
// StemLogsTable Component 
// =======================================

export function StemLogsTable({ stemDetails }) {
  // Safely access the Logs array. No need for JSON.parse as it's an object now.
  let logs = stemDetails?.Logs || [];

  function handleTrack() {
    alert("Sawmill data inserted");
  }

  if (logs.length === 0) {
    return <p className="text-gray-500 text-center py-4">No log information available for this stem.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {logs.map((log) => {

        // Flatten the log object for display in the table
        const transformedLogData = flattenLogData(log);
        const logId = `log-${log.LogKey}`;

        return (
          <AccordionItem className="w-[400px]" key={logId} value={logId}>

            <AccordionTrigger className="font-semibold text-left">
              Log Number: {log.LogKey} (Product: {log.ProductKey})

            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableBody className="max-h-60 overflow-y-auto block">
                  {transformedLogData.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="w-[100%] font-medium text-gray-600">
                        {item.key}
                      </TableCell>
                      <TableCell className="w-[100%] text-right font-mono">
                        {item.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button className="w-full my-5 hover:bg-red-700 cursor-pointer" onClick={handleTrack}>Track</Button>
            </AccordionContent>

          </AccordionItem>
        );
      })}
    </Accordion>
  );
}