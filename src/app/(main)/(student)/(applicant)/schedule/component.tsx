'use client'
import { LoadingSpinner } from '@app/components/loadings';
import { useSession } from '@app/lib/useSession';
import { ScheduleModel } from '@app/types/index';
import clsx from 'clsx';
import moment from 'moment-timezone';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ScheduleAndResultPage() {
  const { data: sessionData } = useSession({ redirect: false })

  const [syData, setSyData] = useState<ScheduleModel>()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    orientation: boolean
    orientationPercentage: number
    exam: string|number
    examPercentage: number
    submittedDocuments: string
    submittedDocumentsPercentage: number
    overallPercentage: number
  }|undefined>()
  const [examScore, setExamScore] = useState<number|undefined>()
  const isOpen = useMemo(() => {
    const startDate = !!syData?.range?.startDate ? moment(syData?.range?.startDate).tz('Asia/Manila').toDate() : undefined
    if (!startDate) return false
    const now = moment.tz('Asia/Manila').toDate()
    return startDate.getTime() <= now.getTime()
  }, [syData])
  const orientationDate = useMemo(() => !!syData?.orientationDate ? moment(syData?.orientationDate).tz('Asia/Manila').toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined, [syData])
  const examDate = useMemo(() => !!syData?.examDate ? moment(syData?.examDate).tz('Asia/Manila').toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined, [syData])
  const endDate = useMemo(() => !!syData?.range?.endDate ? moment(syData?.range?.endDate).tz('Asia/Manila').toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined, [syData])
  const scheduleId = useMemo(() => syData?._id || '', [syData])

  const getSYData = async () => {
    setLoading(true)
    const url = new URL('/api/schedule/now', window.location.origin)
    url.searchParams.append('action', 'scheduleandresult')
    const response = await fetch(url)
    if (response.ok) {
      const { data: d } = await response.json()
      setSyData(d)
    }
    setLoading(false)
  }

  useEffect(() => {
    getSYData()
  }, [])

  useEffect(() => {
    if (!!sessionData?.user?._id && !!syData && isOpen) {
      const exam = syData.examScores.find((exam) => exam.studentId === sessionData.user._id)
      if (!!exam) {
        setExamScore(exam.percentageScore)
      }
    }
  }, [isOpen, syData, sessionData])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/scholarship/results', window.location.origin)
    url.searchParams.append('id', scheduleId)
    const response = await fetch(url)
    if (response.ok) {
      const { data: d } = await response.json()
      setData(d)
    }
    setLoading(false)
  }, [scheduleId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        SCHEDULE AND RESULT
      </div>
      {loading && <div className="text-center"><LoadingSpinner /></div>  }
      {!loading && isOpen && (<>
        <div className="my-8 border bg-white rounded-lg max-w-[700px]">
          <h1 className="px-4 py-3 pb-2 border-b text-xl font-bold bg-yellow-300">Schedule</h1>
          <div className="p-4 grid grid-cols-2">
            <div>Orientation Date:</div>
            <div>{orientationDate}</div>
            <div>Exam Date:</div>
            <div>{examDate}</div>
            <div>Submission of Documents Deadline:</div>
            <div>{endDate}</div>
          </div>
        </div>
        <div className="mb-4 border bg-white rounded-lg max-w-[700px]">
          <h1 className="px-4 py-3 pb-2 border-b text-xl font-bold bg-yellow-300">Result</h1>
          <div className="p-4 grid grid-cols-2">
            <div>Attended Orientation:</div>
            <div className="font-bold text-gray-500">{data?.orientation ? 'Yes' : (moment(syData?.orientationDate).tz('Asia/Manila').isAfter(moment.tz('Asia/Manila')) ? 'N/A' : 'No')}</div>
            <div>Exam Result:</div>
            <div className={clsx('font-bold', !examScore ? 'text-gray-500' : examScore < Number.parseFloat(process.env.NEXT_PUBLIC_EXAM_PASSING || "75") ? 'text-red-600' : 'text-green-700')}>{!!examScore ? examScore + '%' : 'N/A'}</div>
            <div>Submitted Documents:</div>
            <div className="font-bold text-gray-500">{data?.submittedDocuments || 'N/A'}</div>
            <div>Overall Assessment:</div>
            <div className={clsx('font-bold', !data?.overallPercentage ? 'text-gray-500' : data.overallPercentage < 75 ? 'text-red-600' : 'text-green-700')}>{!!data?.overallPercentage ? (data.overallPercentage < 75 ? 'FAILED' : 'PASSED') : <>Results are not yet available.</>}</div>
          </div>
        </div>
      </>)}
    </div>
  </>)
}