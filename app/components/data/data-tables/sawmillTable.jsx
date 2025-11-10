import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,

} from 'material-react-table';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppStore, useControlSawmillModal } from '@/lib/state/store';
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
import { useMap } from "@/context/map-context";


const Example = () => {

  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [similar, setSimilar] = useState(null)
  const [isFetchingSimilar, setIsFetchingSimilar] = useState(true)
  const triggerBackTracking = useAppStore((s) => s.triggerBackTracking)
  const open = useControlSawmillModal((s) => s.open)

  const setTriggerBackTracking = useAppStore((s) => s.setTriggerBackTracking)

  const logNumber = useAppStore((s) => s.logNumber)


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


  useEffect(() => {
    if (triggerBackTracking) {
      console.log(logNumber);
      setGlobalFilter(logNumber)
      setTriggerBackTracking(false)
    }
    if (!open) {

      setGlobalFilter('')
    }
  }, [triggerBackTracking])

  const handleViewDetails = async (row) => {
    // 🎯 Reverting alert() to console.log/custom UI due to environment restrictions
    console.log(`Viewing details for row ID: ${row.original._id}`);
    console.log(`Viewing details for row ID: ${row.original.Length}`);

    const inputValues = {
      length: row.original.Length,
      volume: row.original.Volume,
      vtop: row.original.VTopD,
      buttD: row.original.ButtD,
      
    };

    try {
      const response = await fetch('/api/find-similar-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputValues)
      });

      const similarDocs = await response.json();
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

    ],
    [],
  );

  const setOpenState = useControlSawmillModal((s) => s.setOpenModal);
  const { map } = useMap();
  const SOURCE_ID = 'diif';
  const highlightedFeatureId = useControlSawmillModal((state) => state.highlightedFeatureId);
  const setHighlightedFeatureId = useControlSawmillModal((state) => state.setHighlightedFeatureId);

  const handleExternalSearch = () => {
    if (!map) {
      console.warn("Mapbox map instance is not yet available.");
      return;
    }
    console.log(similar);
    if (!similar || similar.length === 0 || !similar[0].StemKey) {
      console.error("No similar stem data or StemKey found to highlight.");
      return;
    }
    
    const featureIdToHighlight = similar[0].StemKey;
    const coordinates = [similar[0].Longitude, similar[0].Latitude];
    console.log("similar best log", similar[0]);
    
    const previousHighlightedId = highlightedFeatureId;

    if (previousHighlightedId !== null) {
      map.setFeatureState(
        { source: SOURCE_ID, id: previousHighlightedId },
        { highlight: false } // Set back to blue
      );
    }

    // 2. Highlight the new feature (change color to red)
    map.setFeatureState(
      { source: SOURCE_ID, id: featureIdToHighlight },
      { highlight: true } // Set to red
    );

    setHighlightedFeatureId(featureIdToHighlight);

    setOpenState(false);
    map.flyTo({
      center: coordinates,
      zoom: 24,
      speed: 6,
      duration: 5000,
      essential: true,
    });
  };



  const table = useMaterialReactTable({
    columns,
    data,
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
          <DialogContent className="z-100">
            <DialogHeader>
              <DialogTitle className="my-3">The origin stem to the queried log is:</DialogTitle>
              <DialogDescription asChild>
                {isFetchingSimilar ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px' }}>
                    <CircularProgress size={24} sx={{ marginRight: 2 }} />
                    <span>Finding similar stems. Please wait...</span>
                  </Box>
                ) : similar && similar.length > 0 ? (

                  <Table >
                    <TableHeader>
                      <TableRow className="bg-gray-200 hover:bg-gray-200 ">
                        <TableHead>Stem Key</TableHead>
                        <TableHead>Log Number</TableHead>

                        {/* <TableHead>Min. Sim. Score</TableHead> */}
                        <TableHead>Log Length</TableHead>
                        <TableHead>Coordinates</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>

                      <TableRow key={similar[0].StemKey}>
                        <TableCell>{similar[0].StemKey}</TableCell>
                        <TableCell>{similar[0].MatchingLog?.LogKey}</TableCell>

                        {/* <TableCell>{similar[0].minSimilarityScore.toFixed(2)}</TableCell> */}
                        <TableCell>
                          Length: {similar[0].MatchingLog?.LogMeasurement?.LogLength || 'N/A'} (cm)
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

              <Button variant='outlined'
                onClick={handleExternalSearch}>
                View Stem On Map
              </Button>
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
          variant='outlined'
        >
          Export All Data
          <FileDownIcon size="20" />
        </Button>
      </Box>
    ),
    //conditionally render detail panel
    renderDetailPanel: ({ row }) =>
      row.original._id ? (
        <Box
          sx={{
            display: 'grid',
            margin: 'auto',
            width: '80%',
          }}
        >


          <Table >
            <TableHeader>
              <TableRow className="bg-gray-200 hover:bg-gray-200 ">
                <TableHead>TRgRvc</TableHead>
                <TableHead>ButtD</TableHead>
                <TableHead>VTopD</TableHead>
                <TableHead>VMidD</TableHead>
                <TableHead>VButD</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>

              <TableRow key={row.original._id}>
                <TableCell>{row.original.TRgRvc}</TableCell>
                <TableCell>{row.original.ButtD}</TableCell>
                <TableCell>{row.original.VTopD} </TableCell>
                <TableCell>{row.original.VMidD} </TableCell>
                <TableCell>{row.original.VButD}</TableCell>
              </TableRow>

            </TableBody>

          </Table>
        </Box>
      ) : null,
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