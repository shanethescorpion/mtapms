'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import { Montserrat, Poppins } from 'next/font/google';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

export interface TableColumnProps {
  label: string
  field: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  searchable?: boolean
  searchMap?: Record<any, any>
  render?: (row: any) => JSX.Element|string
}

export type SortDirection = 'asc' | 'desc'
export type ChevronDirection = 'both' | 'up' | 'down'

const poppins = Poppins({ weight: '300', subsets: ['latin-ext', 'latin'] })
const montserrat = Montserrat({ weight: '500', subsets: ['latin-ext', 'latin'] })

export function SortButton({ direction, ...props }: { direction: ChevronDirection }) {
  return (
    <button type="button" title="Sort" {...props}>
      <svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        { direction === 'both' && <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"/>}
        { direction === 'up' && <path d="M13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986Z"/>}
        { direction === 'down' && <path d="M13.736 16.048a2.122 2.122 0 0 0-3.472 0L6.837 11.096a1.9 1.9 0 0 0-.11-1.986 2.074 2.074 0 0 0 1.847-1.086h6.852a2.075 2.075 0 0 0 1.847 1.086 1.9 1.9 0 0 0-.11 1.986Z"/>}
      </svg>
    </button>
  )
}

function Toolbars({ columnCount, toolbars = [] }: { columnCount: number, toolbars: React.ReactElement[] }) {
  return toolbars.length > 0 && (
    <tr className="bg-[#00823E]">
      <td colSpan={columnCount} className="px-4">
        <div className="flex flex-nowarp py-2 justify-between gap-x-2 w-full">
          {toolbars.map((toolbar, index) => (
            <Fragment key={index}>
              {toolbar}
            </Fragment>
          ))}
        </div>
      </td>
    </tr>
  )
}

export type RowsPerPage = 10 | 20 | 30 | 50 | 100

export default function Table({ data = [], columns = [], loading = false, sortedBy, sortedDirection, searchable = false, searchString = "", toolbars = [], onSearch = (search: string) => {}, onSort = (sortBy: any) => {}, onSortDirection = (sortDirection: SortDirection) => {} }: Readonly<{ data: any[], columns: TableColumnProps[], loading?: boolean, sortedBy?: any, sortedDirection?: SortDirection, searchable?: boolean, searchString?: string, toolbars?: React.ReactElement[], onSearch?: (search: string) => void, onSort?: (sortBy: any) => void, onSortDirection?: (sortDirection: SortDirection) => void }>) {
  const [search, setSearch] = useState(searchString)
  const [sortBy, setSortedBy] = useState<string>(sortedBy || columns?.[0]?.field || "");
  const [sortDirection, setSortDirection] = useState<SortDirection>(sortedDirection || "asc");
  const filteredData = useMemo(() => data.filter((item) => (
    Object.keys(item).some((key) => {
      const col = columns.find((col) => col.field === key)
      return col?.searchable ? (
        ((typeof item[key] === "string" || typeof item[key] === "number") && ((col.searchMap && Object.hasOwn(col.searchMap, item[key]?.toString() || '')) ? col.searchMap[item[key]]?.toString().toLowerCase().includes(search.trimStart().toLowerCase()) : item[key].toString().trimStart().toString().toLowerCase().includes(search.trimStart().toLowerCase())))
        // || (typeof item[key] === "boolean" && ((col.searchMap && Object.hasOwn(col.searchMap, item[key] ? "true" : "false")) ? col.searchMap[item[key] ? "true" : "false"]?.toString().toLowerCase().includes(search.trimStart().toLowerCase()) : item[key] === Boolean(search.trimStart().toLowerCase())))
        || (item[key] instanceof Date && item[key].toISOString().toLowerCase().includes(search.trimStart().toLowerCase()))
        || (item[key] instanceof Date && item[key].toLocaleDateString('en-PH', { month: '2-digit', day: '2-digit', year: 'numeric' }).includes(search.trimStart().toLowerCase()))
        || (search.trimStart().startsWith('>') && typeof item[key] === "number" && item[key] > parseFloat(search.trimStart().slice(1)))
        || (search.trimStart().startsWith('<') && typeof item[key] === "number" && item[key] < parseFloat(search.trimStart().slice(1)))
        || (search.trimStart().startsWith('>=') && typeof item[key] === "number" && item[key] >= parseFloat(search.trimStart().slice(2)))
        || (search.trimStart().startsWith('<=') && typeof item[key] === "number" && item[key] <= parseFloat(search.trimStart().slice(2)))
        || (search.trimStart().startsWith('!=') && item[key].toString().trimStart().toLowerCase() !== search.trimStart().slice(2).toLowerCase())
        || (!!col.label && typeof item[key] === "number" && search.toLowerCase().startsWith(col.label.toLowerCase()) && search.slice(col.label.length).trimStart().startsWith('>') && item[key] > parseFloat(search.slice(col.label.length).trimStart().substring(1)))
        || (!!col.label && typeof item[key] === "number" && search.toLowerCase().startsWith(col.label.toLowerCase()) && search.slice(col.label.length).trimStart().startsWith('<') && item[key] < parseFloat(search.slice(col.label.length).trimStart().substring(1)))
        || (!!col.label && typeof item[key] === "number" && search.toLowerCase().startsWith(col.label.toLowerCase()) && search.slice(col.label.length).trimStart().startsWith('>=') && item[key] >= parseFloat(search.slice(col.label.length).trimStart().substring(2)))
        || (!!col.label && typeof item[key] === "number" && search.toLowerCase().startsWith(col.label.toLowerCase()) && search.slice(col.label.length).trimStart().startsWith('<=') && item[key] <= parseFloat(search.slice(col.label.length).trimStart().substring(2)))
        || (!!col.label && search.trimStart().toLowerCase().startsWith(col.label.toLowerCase()) && search.trimStart().slice(col.label.length).trimStart().startsWith('!=') && item[key].toString().trimStart().toLowerCase() != search.trimStart().slice(col.label.length).trimStart().substring(2).trimStart().toLowerCase())
        || (!!col.label && search.trimStart().toLowerCase().startsWith(col.label.toLowerCase()) && search.trimStart().slice(col.label.length).trimStart().startsWith('==') && item[key].toString().trimStart().toLowerCase() == search.trimStart().slice(col.label.length).trimStart().substring(2).trimStart().toLowerCase())
      ): false;
    }
  ))), [columns, data, search])

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(filteredData.length / 10), [filteredData])

  const sortedData = useMemo(() => [...filteredData].sort((a: any, b: any) => {
    if (typeof (a[sortBy]) === "string" && typeof (b[sortBy]) === "string") {
      return sortDirection === "asc" ? a[sortBy].localeCompare(b[sortBy].toString()) : b[sortBy].localeCompare(a[sortBy].toString());
    }
    if (typeof (a[sortBy]) === "number" && typeof (b[sortBy]) === "number") {
      return sortDirection === "asc"? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    }
    if (typeof (a[sortBy]) === "boolean" && typeof (b[sortBy]) === "boolean") {
      return (sortDirection === "asc" ? -1 : 1) * (a[sortBy] === true ? -1 : 1);
    }
    return 0;
  }), [filteredData, sortBy, sortDirection]);

  const finalDataTable = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);

  useEffect(() => {
    if (sortedBy) {
      setSortedBy(sortedBy);
    }
    if (sortedDirection) {
      setSortDirection(sortedDirection);
    }
  }, [data, sortedBy, sortedDirection]);

  useEffect(() => {
    onSort && onSort(sortBy);
    onSortDirection && onSortDirection(sortDirection);
  }, [sortBy, sortDirection, onSort, onSortDirection]);

  useEffect(() => {
    setSearch(searchString);
  }, [searchString]);

  useEffect(() => {
    onSearch && onSearch(search);
  }, [search, onSearch]);

  const toggleSort = useCallback((field: any) => {
    if (sortBy === field) {
      const direction = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(direction);
      onSortDirection(direction)
    } else {
      setSortedBy(field);
      setSortDirection("asc");
    }
  }, [sortBy, sortDirection, onSortDirection]);

  const tools = useMemo<React.ReactElement[]>(() => searchable ? [
      <div key={"search_1"} className="min-w-[300px] flex flex-nowrap items-center z-10">
        <label htmlFor="search" className="text-white">
          Search
        </label>
        <div className="relative ml-2 w-full">
          <input
            id="search"
            className="appearance-none w-full bg-transparent border border-gray-200 text-gray-700 rounded-md py-2 px-4 block pl-8 placeholder:text-gray-500 bg-white"
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-[10px] top-[8px] text-gray-500 w-5 h-5" />
        </div>
      </div>,
      ...toolbars
    ] : toolbars
  , [searchable, search, toolbars]);

  const nextPage = useCallback(() => setCurrentPage(finalDataTable.length === 0 ? 0 : Math.min(Math.max(1, currentPage + 1), totalPages)), [currentPage, finalDataTable, totalPages]);
  const previousPage = useCallback(() => setCurrentPage(finalDataTable.length === 0 ? 0 : Math.min(Math.max(1, currentPage - 1), totalPages)), [currentPage, finalDataTable, totalPages]);

  return (
    <div className="relative overflow-x-auto shadow-md">
      <table className="text-xs w-full text-gray-700">
        <thead>
          <Toolbars columnCount={columns.length} toolbars={tools} />
          <tr className="text-white uppercase bg-[#00823E] border border-white">
            { columns.map((col, i: number) => (
              <th key={col + "_" + i} scope="col" className="px-6 py-3">
                <div
                  className={
                    clsx(
                      "flex items-center cursor-pointer",
                      sortBy === col.field ? 'text-yellow-200' : '',
                      "justify-" + (col.align || "left")
                    )
                  }
                  onClick={() => col.sortable && toggleSort(col.field as any)}
                >
                  {col.label}
                  {col.sortable && <SortButton direction={col.field !== sortBy ? 'both' : sortDirection === 'asc' ? 'down' : 'up'} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          { !loading && finalDataTable.map((item: any, index: number) => (
            <tr key={index} className={clsx("border-b hover:bg-gray-50", index % 2 === 0 ? "bg-white" : "bg-gray-200")}>
              {columns.map((col: any, i: number) => (
                <td
                  key={item._id + "_" + i}
                  scope="row"
                  className={
                    clsx(
                      "px-6 py-4 font-medium text-gray-900 whitespace-nowrap",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      (col.align === "left" || !col.align) && "text-left",
                    )
                  }
                >
                  {col.render?.call(null, item) || (typeof item[col.field] !== "number" && !item[col.field] ? "" : item[col.field])}
                </td>
              ))}
            </tr>
          ))}
          { !loading && finalDataTable.length === 0 && (
            <tr className="bg-white border-b hover:bg-gray-50">
              <td scope="row" colSpan={columns.length} className="py-4 font-medium text-gray-500 whitespace-nowrap text-center text-lg">No Data</td>
            </tr>
          )}
          { loading && (
            <tr className="bg-white border-b hover:bg-gray-50">
              <td scope="row" colSpan={columns.length} className="py-4 font-medium text-gray-500 whitespace-nowrap text-center text-lg">Loading...</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div className={clsx(poppins.className, "p-2 flex flex-between items-center")}>
        <div className="text-[#6C6C6C] font-[300] italic text-[13px] leading-[19px] flex-grow">
          viewing {Math.min(finalDataTable.length, currentPage * 10)} of {filteredData.length}
        </div>
        <div className={montserrat.className}>
          <button
            type="button"
            disabled={currentPage === 1}
            className={"px-4 py-1 text-white bg-[#00823E] rounded hover:bg-green-800 disabled:opacity-50"}
            onClick={previousPage}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            className={"px-4 py-1 ml-2 text-white bg-[#00823E] rounded hover:bg-green-800 disabled:opacity-50"}
            onClick={nextPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}