'use client';;
import { Modal } from "@app/components/modals";
import { useSidebar } from "@app/components/sidebar";
import Table, { TableColumnProps } from "@app/components/tables";
import Toaster from "@app/components/toaster";
import { Roles } from "@app/types";
import { ArrowPathIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { addExamScore } from "./action";
import moment from "moment-timezone";

const columns = (onGrade?: (rowData: any) => void): TableColumnProps[] => ([
  {
    label: 'Email',
    field: 'email',
    searchable: true,
    sortable: true
  },
  {
    label: 'Last Name',
    field: 'lastName',
    searchable: true,
    sortable: true
  },
  {
    label: 'First Name',
    field: 'firstName',
    searchable: true,
    sortable: true
  },
  {
    label: 'Middle Name',
    field: 'middleName',
    searchable: true,
    sortable: true
  },
  {
    label: 'Sex',
    field: 'sex',
    align: 'center',
    sortable: true
  },
  {
    label: 'Civil Status',
    field: 'civilStatus',
    align: 'center',
    sortable: true
  },
  {
    label: 'School',
    field: 'nameOfSchoolAttended',
    searchable: true,
    sortable: true
  },
  {
    label: 'School Sector',
    field: 'schoolSector',
    align: 'center',
    searchable: true,
    sortable: true
  },
  {
    label: 'Grade (%)',
    field: 'grade',
    align: 'right',
    searchable: true,
    sortable: true,
    render(rowData: any) {
      if (!rowData.grade.score) return <button type="button" onClick={() => onGrade && onGrade(rowData)} title="Scholar Application Exam Score" className="bg-green-800 hover:bg-green-900 text-white rounded-full pl-2 pr-3 py-1"><PlusCircleIcon className="inline w-4 h-4 mr-1" />Input Score (%)</button>
      return `${rowData.grade.score} %`
    }
  },
  {
    label: 'Remarks',
    field:'remarks',
    align: 'center',
    searchable: true,
    sortable: true,
    render(rowData: any) {
      return (
        <span
          className={clsx(
            'font-bold',
            rowData.remarks === 'FAILED'
            ? 'text-red-500'
            : rowData.remarks === 'PASSED'
            ? 'text-green-700'
            : 'text-gray-300'
          )}
        >{rowData.remarks}</span>
      )
    }
  }
])

export default function ExamPage() {
  const { toggleDrawer, openDrawer } = useSidebar({ role: Roles.Admin })
  const [loading, setLoading] = useState<boolean>(true)
  const [schoolYear, setSchoolYear] = useState<number>((moment.tz('Asia/Manila').toDate()).getFullYear())

  const [data, setData] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>()
  const [examScoreInput, setExamScoreInput] = useState<string>('0.00')
  const [totalItems, setTotalItems] = useState<number|string>('')
  const [score, setScore] = useState<number|string>('')

  const fetchAttendance = useCallback(async () => {
    const url = new URL('/api/grade', window.location.origin)
    url.searchParams.append('academicYear', schoolYear.toString())
    const response = await fetch(url)
    if (response.ok) {
      const { data: gradeData } = await response.json()
      setData(gradeData)
    }
  }, [schoolYear])

  const fetchRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await fetchAttendance()
    } catch(e) {
      console.log(e)
    }
    setLoading(false)
  }, [fetchAttendance])

  const fetchAY = async () => {
    setLoading(true)
    const url = new URL('/api/schedule/now', window.location.origin)
    const response = await fetch(url)
    if (response.ok) {
      const { data } = await response.json()
      if (!!data) {
        setSchoolYear(data.academicYear)
      }
    }
  }

  useEffect(() => {
    fetchAY()
    .then(fetchRefresh)
    .then(() => setLoading(false))
    .catch((e) => {console.log(e); setLoading(false)})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCloseModal = useCallback(() => setSelectedStudent(null), [])

  const onSubmitScore = useCallback(async (rowData: any) => {
    try {
      const attend = addExamScore.bind(null, schoolYear, rowData._id, examScoreInput)
      const { success, error } = await attend()
      if (error) {
        Toaster.error(error, { timer: 3000 })
      } else if (success) {
        Toaster.success(success, { timer: 3000 })
        setTimeout(() => fetchRefresh(), 100)
        onCloseModal()
      }
    } catch (e) {
      console.log(e)
    }
  }, [schoolYear, examScoreInput, fetchRefresh, onCloseModal])

  const onOpenModal = useCallback((rowData: any) => {
    if (openDrawer) {
      toggleDrawer()
    }
    setSelectedStudent(rowData)
  }, [openDrawer, toggleDrawer])

  useEffect(() => {
    if (!!selectedStudent) {
      if (!!totalItems && parseInt(totalItems.toString()) > 0 && !!score && parseInt(score.toString()) > 0 && parseInt(score.toString()) <= parseInt(totalItems.toString()))  {
        const percent = (parseInt(score.toString()) / parseInt(totalItems.toString())) * 100
        setExamScoreInput(parseFloat(percent.toFixed(3)).toString())
      }
      if (!totalItems && !!score) {
        setScore('')
      }
    }
  }, [selectedStudent, score, totalItems])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        SCHOLARSHIP EXAMINATION (A.Y. {schoolYear} - {schoolYear + 1})
      </div>
      <div className="text-right">
        <button type="button" className="bg-green-700 hover:bg-green-600 text-white rounded-full px-4 py-2 mr-2 mb-2" onClick={fetchRefresh}>
          <ArrowPathIcon className="w-4 h-4 inline mr-1" />Refresh
        </button>
      </div>
      <div className="overflow-y-auto max-h-[520px] min-h-[520px]">
        <Table columns={columns(onOpenModal)} loading={loading} data={data} searchable toolbars={[<div key="titlekey" className="xl:absolute xl:left-0 xl:top-0 h-fit w-full xl:pt-3 text-center text-white drop-shadow-lg uppercase font-bold text-xl z-0">Examination Scores</div>]}/>
      </div>
    </div>
    <Modal title="Input Scholarship Examination Score" onClose={onCloseModal} open={!!selectedStudent}>
      <div className="p-6">
        <div className="text-xl font-bold">Input the score in percentage for <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> ({selectedStudent?.email}):</div>
        <div className="mt-4 flex flex-nowrap justify-start gap-x-1 items-center">
          <div>By Percentage</div>
          <input type="number" className="p-2 rounded-md border border-gray-500 focus:border-blue-600 text-right read-only:bg-gray-200" placeholder="Enter score (%)" min="0" max="100" step="0.01" value={examScoreInput} onChange={(ev) => setExamScoreInput(ev.target.value)} readOnly={!!score || !!totalItems}/>
          <span className="font-bold text-xl">%</span>
          <div className="flex-grow text-center border-x px-2 mx-2 font-[500]">
            OR
          </div>
          <div className="flex gap-x-2 items-center">
            <div>By Item Score</div>
            <input type="number" className="p-2 rounded-md border border-gray-500 focus:border-blue-600 disabled:bg-gray-200 max-w-32 text-right" placeholder="Enter Score" min="0" step="1" value={score} onChange={(e: any) => setScore(e.target.value)} disabled={!totalItems || totalItems == 0} />
            <div className="font-bold">over</div>
            <input type="number" className="p-2 rounded-md border border-gray-500 focus:border-blue-600 max-w-32 text-right" placeholder="Total Items" min="0" step="1" value={totalItems} onChange={(e: any) => setTotalItems(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" disabled={isNaN(parseFloat(examScoreInput)) || parseFloat(examScoreInput) <= 0 || parseFloat(examScoreInput) > 100} className="disabled:bg-gray-300 bg-green-800 hover:bg-green-700 text-white rounded-full px-4 py-2" onClick={() => onSubmitScore(selectedStudent)}>Submit Score</button>
          <button type="button" className="ml-4 text-gray-600 hover:text-gray-900 border border-gray-600 rounded-full px-4 py-2" onClick={onCloseModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  </>)
}