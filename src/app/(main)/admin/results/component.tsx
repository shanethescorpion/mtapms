'use client';
import { LoadingSpinner } from "@app/components/loadings";
import { Modal } from "@app/components/modals";
import { useSidebar } from "@app/components/sidebar";
import Table, { TableColumnProps } from "@app/components/tables";
import Toaster from "@app/components/toaster";
import { ApplicationStatus, Roles, ScheduleModel } from "@app/types";
import clsx from "clsx";
import moment from "moment-timezone";
import { useCallback, useEffect, useMemo, useState } from "react";
import { grantScholarship } from "./action";

function getRankString(num: number): string {
  if (typeof num !== 'number' || num < 1 || !Number.isInteger(num)) {
      throw new Error('Input must be a positive integer.');
  }
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  let suffix: string;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      suffix = 'th';
  } else {
      switch (lastDigit) {
          case 1:
              suffix = 'st';
              break;
          case 2:
              suffix = 'nd';
              break;
          case 3:
              suffix = 'rd';
              break;
          default:
              suffix = 'th';
              break;
      }
  }
  return `${num}${suffix}`;
}

const columns = (onDecideGrant: (rowData: any) => void): TableColumnProps[] => ([
  {
    label: 'Rank',
    field: 'rank',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return getRankString(rowData.rank)
    }
  },
  {
    label: 'Student ID',
    field: 'studentId',
    sortable: true,
    searchable: true,
  },
  {
    label: 'Full Name',
    field: 'fullName',
    sortable: true,
    searchable: true
  },
  {
    label: 'Year Level',
    field: 'yearLevel',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return rowData.yearLevel === 1
        ? '1st Year'
        : rowData.yearLevel === 2
        ? '2nd Year'
        : rowData.yearLevel === 3
        ? '3rd Year'
        : rowData.yearLevel === 4
        ? '4th Year'
        : undefined
    }
  },
  {
    label: 'Course',
    field: 'course',
    sortable: true,
    searchable: true
  },
  {
    label: 'School',
    field: 'nameOfSchoolAttended',
    sortable: true,
    searchable: true
  },
  {
    label: 'Orientation',
    field: 'orientation',
    sortable: true,
    align: 'center',
    render(rowData: any) {
      return rowData.orientation
        ? 'Yes'
        : 'No'
    }
  },
  {
    label: 'Orientation (10%)',
    field: 'orientationPercentage',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return `${rowData.orientationPercentage} %`
    }
  },
  {
    label: 'Examination',
    field: 'exam',
    sortable: true,
    align: 'center',
    render(rowData: any) {
      return rowData.exam.toString() !== 'N/A' ? rowData.exam.toString() + '%' : 'N/A'
    }
  },
  {
    label: 'Examination (40%)',
    field: 'examPercentage',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return `${rowData.examPercentage} %`
    }
  },
  {
    label: 'Submitted Documents',
    field: 'submittedDocuments',
    sortable: true,
    align: 'center',
  },
  {
    label: 'Submitted Documents (50%)',
    field: 'submittedDocumentsPercentage',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return `${rowData.submittedDocumentsPercentage} %`
    }
  },
  {
    label: 'Application Form Status',
    field: 'applicationStatus',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return <div className={clsx("capitalize font-500", rowData.applicationStatus === ApplicationStatus.Rejected ? "text-red-500" : "text-green-500")}>{rowData.applicationStatus}</div>
    }
  },
  {
    label: 'Overall Percentage (100%)',
    field: 'overallPercentage',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return rowData.overallPercentage > 75
      ? <button type="button" onClick={() => !rowData.grantee && onDecideGrant(rowData)} className="font-bold text-green-700 px-2 py-1 rounded-lg bg-green-50 border shadow shadow-green-100 hover:bg-green-100">{rowData.overallPercentage} %</button>
      : <span className="font-bold text-red-600">{rowData.overallPercentage} %</span>
    }
  },
  {
    label: 'Grantee',
    field: 'grantee',
    sortable: true,
    searchable: true,
    align: 'center',
    render(rowData: any) {
      return <span className={clsx("font-bold", rowData.grantee ? 'text-green-600' : 'text-gray-500')}>{rowData.grantee ? 'Yes' : 'No'}</span>
    }
  },
] as TableColumnProps[])

export default function ResultsPage() {
  const { toggleDrawer, openDrawer } = useSidebar({ role: Roles.Admin})
  const [loading, setLoading] = useState(false)
  const [syData, setSYData] = useState<ScheduleModel[]>([])
  const schoolYearList = useMemo<number[]>(() => {
    let sylist: number[] = []
    if (syData.length > 0) {
      sylist = syData.map((item: ScheduleModel) => item.academicYear);
    }
    const thisYear: number = moment.tz('Asia/Manila').toDate().getFullYear();
    if (!sylist.includes(thisYear)) {
      sylist.unshift(thisYear);
    }
    sylist = sylist.sort((a: number, b: number) => b - a > 0 ? 1 : b - a < 0 ? -1 : 0);
    return sylist
  }, [syData])
  const [schoolYear, setSchoolYear] = useState<number|string>((moment.tz('Asia/Manila').toDate()).getFullYear())
  const scheduleId = useMemo<string>(() => syData.find((item: ScheduleModel) => item.academicYear.toString() === schoolYear.toString())?._id || '', [syData, schoolYear])
  const getSYData = async () => {
    setLoading(true)
    const url = new URL('/api/schedule/data', window.location.origin)
    const response = await fetch(url)
    if (response.ok) {
      const { data } = await response.json()
      setSYData(data)
    }
    setLoading(false)
  }
  useEffect(() => {
    getSYData()
  }, [])

  const [filledSlots, setFilledSlots] = useState<number>(0)
  const [totalSlots, setTotalSlots] = useState<number>(0)
  const [isOpenSlots, setIsOpenSlots] = useState<boolean>(false)
  const [data, setData] = useState<any[]>([])
  const [showGranteesOnly, setShowGranteesOnly] = useState<boolean>(false)
  const [showNonGranteesOnly, setShowNonGranteesOnly] = useState<boolean>(false)
  const filteredData = useMemo(() => showGranteesOnly !== showNonGranteesOnly ? data.filter((item) => showGranteesOnly ? item.grantee : showNonGranteesOnly ? !item.grantee : true) : data, [data, showGranteesOnly, showNonGranteesOnly])

  const fetchResultData = useCallback(async () => {
    if (!!scheduleId) {
      setLoading(true)
      const url = new URL('/api/scholarship/results', window.location.origin)
      url.searchParams.append('id', scheduleId)
      const response = await fetch(url)
      if (response.ok) {
        const { data, filledSlots: f, totalSlots: t, isOpenSlots: o } = await response.json()
        setFilledSlots(f)
        setTotalSlots(t)
        setIsOpenSlots(o)
        setData(data)
      }
      setLoading(false)
    }
  }, [scheduleId])

  useEffect(() => {
    fetchResultData()
  }, [fetchResultData])

  const [selectedDecideGrant, setSelectedDecideGrant] = useState<any>()

  const onDecideGrant = useCallback((rowData: any) => {
    if (!isOpenSlots) {
      Toaster.info('You cannot grant grants when slots are closed.')
      return
    }
    if (openDrawer) toggleDrawer();
    setSelectedDecideGrant(rowData)
  }, [isOpenSlots, openDrawer, toggleDrawer])

  const allColumns = useMemo(() => [...columns(onDecideGrant)], [onDecideGrant])

  const onCloseModal = useCallback(() => {
    setSelectedDecideGrant(undefined)
  }, [])

  const handleGrant = useCallback(async () => {
    if (!!selectedDecideGrant) {
      const grantStudent = grantScholarship.bind(null, scheduleId, selectedDecideGrant._id)
      const { success, error } = await grantStudent()
      if (error) {
        Toaster.error(error)
      } else if (success) {
        Toaster.success(success)
        setTimeout(() => {
          fetchResultData()
        }, 500);
      }
    }
    onCloseModal()
  }, [selectedDecideGrant, scheduleId, fetchResultData, onCloseModal])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        Scholarship Results (A.Y. {schoolYear} - {parseInt(schoolYear as string) + 1})
      </div>
      <div className="mb-2">
        <label htmlFor="schoolYear" className="font-[500] text-[15px] mb-2 mr-2">Select Academic Year:</label>
        <select id="schoolYear" title="Academic Year" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} className="py-1 px-2 bg-white rounded text-center border border-black">
          {schoolYearList.map((sy: number) => (
            <option key={sy} value={sy}>A.Y. {sy} - {sy + 1}</option>
          ))}
        </select>
      </div>
      { loading && <div className="mb-4"><LoadingSpinner /></div>}
      { !loading && (
        <h2 className="font-[500] my-4 text-lg">Available Slots: {filledSlots} / {totalSlots} <span className={clsx(
          "ml-4 px-2 py-1 rounded border",
          isOpenSlots ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
        )}>{isOpenSlots ? 'Open Slots' : 'Closed'}</span></h2>
      )}
      <Table
        columns={allColumns}
        data={filteredData}
        loading={loading}
        searchable
        toolbars={[
          <div key="filter-grantees" className="text-black flex justify-around items-center bg-white/50 px-2 rounded">
            <input type="checkbox" checked={showGranteesOnly} onChange={(e) => setShowGranteesOnly(e.target.checked)} id="filter-grantees" title="Filter Grantees" className="cursor-pointer" />
            <label htmlFor="filter-grantees" className="font-[500] text-[15px] ml-2 cursor-pointer">Show grantees only</label>
          </div>,
          <div key="filter-non-grantees" className="text-black flex justify-around items-center bg-white/50 px-2 rounded">
            <input type="checkbox" checked={showNonGranteesOnly} onChange={(e) => setShowNonGranteesOnly(e.target.checked)} id="filter-non-grantees" title="Filter Grantees" className="cursor-pointer" />
            <label htmlFor="filter-non-grantees" className="font-[500] text-[15px] ml-2 cursor-pointer">Show non-grantees only</label>
          </div>,
          <div key="dsd" className="flex-grow"></div>
        ]}
      />
    </div>
    <Modal title="Grant Scholar to student?" open={!!selectedDecideGrant} onClose={onCloseModal}>
      <div className="p-4">
          <div>Do you want <span className="text-green-900 bg-green-100 px-2 py-1 rounded font-[600]">{selectedDecideGrant?.fullName}&nbsp;
          (Student ID: {selectedDecideGrant?.studentId})</span> for scholarship grant?</div>
          <p>This is irreversible</p>
          <div className="flex justify-end gap-x-4 mt-4">
            <button type="button" className="px-4 py-2 rounded bg-green-700 text-white font-medium" onClick={handleGrant}>Yes, Grant Scholarship</button>
            <button type="button" className="px-4 py-2 rounded bg-red-500 text-white font-medium" onClick={onCloseModal}>No, Cancel</button>
          </div>
      </div>
    </Modal>
  </>)
}