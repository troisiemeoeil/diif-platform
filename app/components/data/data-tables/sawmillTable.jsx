import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,

} from 'material-react-table';
import { Box, Button, IconButton } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';


const Example = () => {
  //data and fetching state
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

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


  const handleViewDetails = (row) => {
    // 🎯 Reverting alert() to console.log/custom UI due to environment restrictions
    console.log(`Viewing details for row ID: ${row.original._id}`);
    // Replace with navigation or modal logic in a real app
  };
  //if you want to avoid useEffect, look at the React Query example instead
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
    fetchData();
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
        accessorKey: '_id',
        header: 'Id',
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

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnFilterModes: true,
    enableColumnActions: false,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: true,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '4px' }}>

        {/* You can add more actions here (e.g., Edit, Delete) */}
        <Button
          onClick={() => handleViewDetails(row)}
          variant="outlined"
          size="small"
        >
          Track
        </Button>
      </Box>
    ),
    enableRowSelection: true,
    getRowId: (row) => row._id,
    initialState: {
     
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableHiding: false,
    enableFullScreenToggle: false,
    muiToolbarAlertBannerProps: isError
      ? {
        color: 'error',
        children: 'Error loading data',
      }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return <MaterialReactTable table={table} />;
};

export default Example;