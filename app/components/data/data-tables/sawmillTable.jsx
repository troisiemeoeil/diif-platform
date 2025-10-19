import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,

} from 'material-react-table';
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDownIcon } from 'lucide-react';
import { mkConfig, generateCsv, download } from 'export-to-csv';


const Example = () => {
  //data and fetching state
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [similar, setSimilar] = useState(null)
  const [isFetchingSimilar, setIsFetchingSimilar] = useState(true)


  //table state
  const [columnFilters, setColumnFilters] = useState(
    [],
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState({});


  const handleViewDetails = async (row) => {
    // 🎯 Reverting alert() to console.log/custom UI due to environment restrictions
    console.log(`Viewing details for row ID: ${row.original._id}`);
    console.log(`Viewing details for row ID: ${row.original.Length}`);

    const inputValues = {
      length: row.original.Length,
      volume: row.original.Volume,
      vtop: row.original.VTopD,
      buttD: row.original.ButtD
    };

    try {
      const response = await fetch('/api/find-similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputValues)
      });

      const similarDocs = await response.json();
      console.log(similarDocs);
      setSimilar(similarDocs);
      setIsFetchingSimilar(false);

    } catch (error) {
      console.error("Error finding similar documents:", error);
      setIsFetchingSimilar(false);
    }

  };

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportRows = async (rows) => {
    const rowData = rows.map((row) => row.original);
    console.log(rowData);
    if (Object.keys(rowSelection).length === 0) {
      alert('No rows selected for export.');
      return;
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIds: Object.keys(rowSelection) }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch selected rows for export.');
      }

      const selectedData = await response.json();
      const csv = generateCsv(csvConfig)(selectedData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error('Error exporting rows:', error);
      alert('An error occurred during export. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }



      const url = new URL('/api/data', location.origin);
      url.searchParams.set(
        'start',
        `${pagination.pageIndex * pagination.pageSize}`,
      );
      url.searchParams.set('size', `${pagination.pageSize}`);
      url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
      url.searchParams.set('globalFilter', globalFilter ?? '');
      url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

      try {

        const response = await fetch(url);
        if (!response.ok) {
          // Handle API errors gracefully
          const errorBody = await response.json();
          console.error("API Fetch Error:", errorBody.error || response.statusText);
          setData([]);
          setRowCount(0);
          // You might also want to show a user-facing error message here
          alert("API Fetch Error: Please notify administrators.")
          return; // Stop execution
        }

        // If the response is OK (status 200), then proceed
        const json = await response.json();

        setData(json.data);
        setRowCount(json.meta.totalRowCount);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters, //re-fetch when column filters change
    globalFilter, //re-fetch when global filter changes
    pagination.pageIndex, //re-fetch when page index changes
    pagination.pageSize, //re-fetch when page size changes
    sorting
  ]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'LogNr',
        header: 'Log Number',
      },
      {
        accessorKey: 'Region',
        header: 'Region',
      },
      {
        accessorKey: 'Species',
        header: 'Species',
      },
      //column definitions...
      {
        accessorKey: 'Length',
        header: 'Length',
      },
      {
        accessorKey: 'Volume',
        header: 'Volume',
      },
      {
        accessorKey: 'TRgRvc',
        header: 'TRgRvc',
      },
      {
        accessorKey: 'ButtD',
        header: 'ButtD',
      },
      {
        accessorKey: 'VTopD',
        header: 'VTopD',
      },
      {
        accessorKey: 'VMidD',
        header: 'VMidD',
      }, {
        accessorKey: 'VButD',
        header: 'VButD',
      },

    ],
    [],
  );

  const handleExternalSearch = () => {
    // This is the key: tell the table instance to update its global filter state.
    // This change propagates to the 'globalFilter' state, which is a dependency
    // of your useEffect, triggering a new data fetch.
    table.setGlobalFilter("68ecf322d9248896e4b0d446");
  };

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableColumnActions: true,
    enableFacetedValues: true,
    enableRowActions: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'standard',
    },
    muiPaginationProps: {
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '4px' }}>
        <Dialog>
          <DialogTrigger>
            <div>

              <a
                onClick={() => handleViewDetails(row)}

                className='bg-black p-3 hover:cursor-pointer hover:bg-[#333] rounded-sm m-1 text-white'
              >
                Track
              </a>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>The relevant stem to the queried logs is:</DialogTitle>
              <DialogDescription asChild>
                {isFetchingSimilar ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px' }}>
                    <CircularProgress size={24} sx={{ marginRight: 2 }} />
                    <span>Finding similar stems. Please wait...</span>
                  </Box>
                ) : similar && similar.length > 0 ? (

                  <Table >
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stem Key</TableHead>
                        <TableHead>Min. Sim. Score</TableHead>
                        <TableHead>Best Log (L/T)</TableHead>
                        <TableHead>Coordinates</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>

                      <TableRow key={similar[0].StemKey}>
                        <TableCell>{similar[0].StemKey}</TableCell>
                        <TableCell>{similar[0].minSimilarityScore.toFixed(2)}</TableCell>
                        <TableCell>
                          Length: {similar[0].BestMatchingLog?.LogMeasurement?.LogLength || 'N/A'} (cm)
                          <br />
                          TopOb: {similar[0].BestMatchingLog?.LogMeasurement?.TopOb || 'N/A'} (mm)
                        </TableCell>
                        <TableCell>
                          Lat: {similar[0].Latitude}
                          <br />
                          Lon: {similar[0].Longitude}
                        </TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                ) : (
                  <span>Similar stem found for this log will be displayed here.</span>
                )}
              </DialogDescription>
              <Button variant='outlined' onClick={handleExternalSearch}>View Stemgit  On Map</Button>

            </DialogHeader>
          </DialogContent>
        </Dialog>

      </Box>
    ),

    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: "end",
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          disabled={Object.keys(rowSelection).length === 0}
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          className='items-center gap-2'
        >
          Export All Data
          <FileDownIcon size="20" />
        </Button>
      </Box>
    ),

    enableRowSelection: true,
    getRowId: (row) => row._id,

    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableHiding: true,
    enableFullScreenToggle: false,
    muiToolbarAlertBannerProps: isError
      ? {
        color: 'error',
        children: 'Error loading data',
      }
      : undefined,
    onColumnFiltersChange: (updater) => setColumnFilters(updater),
    onGlobalFilterChange: (updater) => setGlobalFilter(updater),
    onPaginationChange: (updater) => setPagination(updater),
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => setSorting(updater),
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      rowSelection,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return <MaterialReactTable table={table} />;
};

export default Example;