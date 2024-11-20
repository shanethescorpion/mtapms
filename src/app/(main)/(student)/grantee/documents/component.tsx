'use client'
/* eslint-disable @next/next/no-img-element */
import { LoadingSpinner } from "@app/components/loadings";
import { Modal } from "@app/components/modals";
import { useSidebar } from "@app/components/sidebar";
import Toaster from "@app/components/toaster";
import { useSession } from "@app/lib/useSession";
import {
  GranteeModel,
  Roles,
  ScheduleModel,
  Semester,
  StudentModel,
  SubmissionProps,
  SubmissionStatus,
} from "@app/types";
import { CheckBadgeIcon, ClockIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import moment from "moment-timezone";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uploadSubmission } from "./action";

interface RequirementTitles {
  name: string;
  description: string;
  key: string;
}

export default function DocumentRequirementsPage() {
  const { data: sessionData, status } = useSession({ redirect: false })
  const { toggleDrawer, openDrawer } = useSidebar({ role: Roles.Grantee });
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<StudentModel & { granteeSubmissions?: GranteeModel, gradeStatus?: "Passed"|"Failed"|"Warning" }>();

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
  const allSchoolYearList = useMemo<number[]>(() => {
    let sylist: number[] = []
    if (syData.length > 0) {
      const syList = syData.map((item: ScheduleModel) => Number.parseInt(item.academicYear.toString()));
      const minYear = Math.min(...syList, (new Date()).getFullYear());
      const maxYear = Math.max(...syList, (new Date()).getFullYear());
      sylist = Array.from({ length: maxYear - minYear + 1 }).map((_, i: number) => {
        return (minYear - 1) + (i+1)
      });
      if (sylist.length > 0) {
        if(sylist[sylist.length - 1] === (new Date()).getFullYear()) {
          sylist.push((new Date()).getFullYear() + 1)
        }
        if(sylist[sylist.length - 1] < (new Date()).getFullYear()) {
          for (let ii = maxYear + 1; ii <= (new Date()).getFullYear() + 1; ii++) {
            sylist.push(ii);
          }
        }
      }
    }
    if (sylist.length === 0) {
      sylist = [(new Date()).getFullYear(), (new Date()).getFullYear() + 1]
    }
    return sylist
  }, [syData])

  const [schoolYear, setSchoolYear] = useState<number|string|undefined>()
  const [semester, setSemester] = useState<Semester|string>(Semester.FirstSemester)

  const requirements = useMemo<RequirementTitles[]>(() =>
    [
      {
        name: 'COG',
        description: 'Upload photo of your Certificate of Grade (COG)',
        key: 'COG',
      },
      {
        name: 'Study Load',
        description: 'Upload photo of your Study Load',
        key: 'studyLoad',
      },
      {
        name: 'Statement of Account',
        description: 'Upload photo of your Statement of Account',
        key: 'statementOfAccount',
      },
      {
        name: 'CONS',
        description: 'Certificate of Non-Scholar',
        key: 'CONS',
      },
    ]
  , []);

  const getSYData = async () => {
    setLoading(true)
    const url = new URL('/api/schedule/data', window.location.origin)
    const response = await fetch(url)
    if (response.ok) {
      const { data: d } = await response.json()
      setSYData([...d])
      const mappedData = d.map((item: ScheduleModel) => item.academicYear);
      const latestSY = Math.max(...mappedData);
      setLoading(false)
      return latestSY
    }
    return ''
  }

  const fetchData = useCallback(async (sy: string|number) => {
    setLoading(true)
    let student = null
    try {
      const url = new URL('/api/scholarship/applications', window.location.origin)
      url.searchParams.append('studentId', sessionData.user._id)
      url.searchParams.append('academicYear', !schoolYear ? sy.toString() : schoolYear.toString())
      const response = await fetch(url)
      if (response.ok) {
        const { data: st } = await response.json()
        student = st
      }
    } catch (e) {}
    try {
      const url = new URL('/api/scholarship/grantees', window.location.origin)
      url.searchParams.append('academicYear', !schoolYear ? sy.toString() : schoolYear.toString())
      url.searchParams.append('semester', semester?.toString() || '')
      url.searchParams.append('type', 'grantee')
      const response = await fetch(url)
      if (response.ok) {
        const { data: d } = await response.json()
        setData(d);
      }
    } catch (e) {}
    setLoading(false)
  }, [sessionData.user._id, schoolYear, semester])

  const refreshData = useCallback(() => {
    getSYData()
      .then(fetchData)
      .catch(() => setLoading(false))
  }, [fetchData])

  useEffect(() => {
    if (status === 'authenticated') {
      refreshData()
    }
  }, [refreshData, status])

  useEffect(() => {
    if (!!syData && syData.length > 0 && !schoolYear) {
      const mappedSY = syData.map((item: ScheduleModel) => item.academicYear);
      const latestSY = Math.max(...mappedSY, (new Date()).getFullYear());
      setSchoolYear(latestSY);
    }
  }, [syData, schoolYear])

  const getRequirementSubmissionFromKey = useCallback((key?: string): SubmissionProps|undefined => {
    if (!key) return undefined
    return (data?.granteeSubmissions as GranteeModel)?.[key as keyof { COG: SubmissionProps, studyLoad: SubmissionProps, statementOfAccount: SubmissionProps, CONS: SubmissionProps }]
  }, [data])

  const formRef = useRef<HTMLFormElement>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<(RequirementTitles & { submission?: SubmissionProps })|undefined>();

  const onSelectedRequirement = useCallback((req: RequirementTitles & { submission?: SubmissionProps }) => {
    if (openDrawer) {
      toggleDrawer()
    }
    setSelectedRequirement(req)
  }, [openDrawer, toggleDrawer])

  const onCloseModal = useCallback(() => {
    formRef.current?.reset();
    setTimeout(() => setSelectedRequirement(undefined), 100)
  }, [])

  const [fileSubmission, setFileSubmission] = useState<File|undefined>()

  const onSubmitRequirement = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fileSubmission) {
      Toaster.error('Please select a file to submit.')
      return
    }
    const formData = new FormData();
    formData.append('file', fileSubmission, fileSubmission.name)
    const upload = uploadSubmission.bind(null, selectedRequirement!.key!, schoolYear as string|number, semester as Semester)
    const { success, error } = await upload(formData)
    if (error) {
      Toaster.error(error)
    } else if (success) {
      Toaster.success(success)
      refreshData()
      formRef.current?.reset();
      setTimeout(() => onCloseModal(), 100);
    }
  }, [fileSubmission, selectedRequirement, onCloseModal, refreshData, schoolYear, semester])

  const getURLForSubmission = useCallback((photoId?: string) => (new URL("/api/user/photo/" + photoId, window.location.origin)).toString(), [])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        DOCUMENTS REQUIREMENTS
      </div>
      <div className="mb-2">
        <label htmlFor="schoolYear" className="text-[15px] mb-2 mr-2 font-bold text-lg">Academic Year:</label>
        <select id="schoolYear" title="Academic Year" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} className="py-1 px-2 bg-white rounded text-center border border-black">
          {allSchoolYearList.map((sy: number) => (
            <option key={sy} value={sy}>A.Y. {sy} - {sy + 1}</option>
          ))}
        </select>
      </div>
      <div className="py-2 font-[500] text-[15px] leading-[19px]">
        <label htmlFor="semester" className="mr-2 font-bold text-lg">Semester:</label>
        <select name="semester" id="semester" title="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} className="px-2 py-1 rounded bg-white border border-gray-400 cursor-pointer">
          <option value={Semester.FirstSemester}>First Semester</option>
          <option value={Semester.SecondSemester}>Second Semester</option>
        </select>
      </div>
      <div className="py-2 font-[500] text-[15px] leading-[19px]">
        <div className="mr-2 font-bold text-lg">Current Grade: {!!data?.granteeSubmissions?.grade ? (Number.parseFloat(data.granteeSubmissions.grade.toString()).toString().length === 1 ? data.granteeSubmissions.grade.toFixed(1) : Number.parseFloat(data.granteeSubmissions.grade.toFixed(3))) : "N/A"}</div>
        <div className="mr-2 font-bold text-lg">Current Status: <span className={clsx("uppercase", data?.gradeStatus === "Passed" ? "text-green-600" : data?.gradeStatus === "Warning" ? "text-orange-500" : "text-red-500")}>{data?.gradeStatus}</span></div>
      </div>
      <div className="flex flex-wrap justify-start items-start gap-4 p-4">
        { loading && <LoadingSpinner /> }
        {/* Document cards */}
        { !loading && !!data?.granteeSubmissions && requirements.map((req: RequirementTitles) => (
          <button key={req.key} type="button" disabled={data.gradeStatus === "Failed"} onClick={() => onSelectedRequirement({...req, submission: getRequirementSubmissionFromKey(req.key) })} className={clsx("relative w-[200px] bg-[#F9F9F9] disabled:bg-gray-300 disabled:opacity-50 border rounded-lg shadow-md p-6", selectedRequirement?.key === req.key ? 'bg-yellow-100' : '')} title={!getRequirementSubmissionFromKey(req.key) ? 'Submission needed' : getRequirementSubmissionFromKey(req.key)!.status}>
            <ExclamationCircleIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-yellow-500", !getRequirementSubmissionFromKey(req.key) ? '' : 'hidden')} />
            <ClockIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-gray-500", getRequirementSubmissionFromKey(req.key)?.status === SubmissionStatus.Pending ? '' : 'hidden')} />
            <CheckBadgeIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-green-500", getRequirementSubmissionFromKey(req.key)?.status === SubmissionStatus.Approved ? '' : 'hidden')} />
            <XCircleIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-red-500", getRequirementSubmissionFromKey(req.key)?.status === SubmissionStatus.Disapproved ? '' : 'hidden')} />
            <div className="w-fit mx-auto">
              <Image src="/doc-icon.svg" alt="Document Icon" width={150} height={150} />
            </div>
            <div className="text-lg font-bold w-full text-center pt-3 border-b">{req.name}</div>
            <p className="text-xs w-full text-start pt-1">{req.description}</p>
          </button>
        ))}
        { !loading && !data?.granteeSubmissions && <div className="text-center text-gray-500">Nothing to submit here.</div> }
      </div>
    </div>
    <Modal title={(!selectedRequirement?.submission || selectedRequirement?.submission?.status === SubmissionStatus.Disapproved) ? 'Submit Requirement' : 'Submitted Requirement'} open={!!selectedRequirement} onClose={onCloseModal}>
      <div className="pt-2 px-6">
        {(!selectedRequirement?.submission || selectedRequirement?.submission?.status === SubmissionStatus.Disapproved) && (<>
          <form ref={formRef} onSubmit={onSubmitRequirement}>
            <label className="block mb-2 font-medium text-gray-900" htmlFor="file_input">Upload submission for <span className="font-bold">{selectedRequirement?.name}</span>:</label>
            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" aria-describedby="file_input_help" id="file_input" type="file" accept=".png, .jpg, .jpeg" onChange={(e) => setFileSubmission(e.target.files?.[0])} />
            <p className="mt-1 text-sm text-gray-500 mb-4" id="file_input_help">PNG or JPG</p>
            <button  type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
              Submit
            </button>
          </form>
          {!!selectedRequirement?.submission && (
            <div className="font-[500] mt-4 p-2 border border-black rounded">
              <div className="text-gray-500">
                Submission status: <span className="text-red-500">{SubmissionStatus[selectedRequirement?.submission?.status]}</span>
              </div>
              <div className="text-gray-500">
                Last update: {moment(selectedRequirement?.submission?.updatedAt!).tz('Asia/Manila').toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}
              </div>
              <div className="max-w-[700px] max-h-[calc(100vh-400px)] mt-4 shadow-lg border overflow-y-auto">
                <img src={!!selectedRequirement?.submission?.photo ? getURLForSubmission(selectedRequirement.submission.photo as string) : ''} alt="Submission" width={1000} height={1000} className="w-full h-full" />
              </div>
            </div>
          )}
        </>)}
        {(selectedRequirement?.submission?.status === SubmissionStatus.Pending || selectedRequirement?.submission?.status === SubmissionStatus.Approved) && (
          <div className="font-[500]">
            <div className="text-gray-500">
              Submission status: {SubmissionStatus[selectedRequirement?.submission?.status]}
            </div>
            <div className="mt-4 text-gray-500">
              Last update: {moment(selectedRequirement?.submission?.updatedAt!).tz('Asia/Manila').toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}
            </div>
            {selectedRequirement?.submission?.status === SubmissionStatus.Pending && (
              <div className="mt-4 text-center text-white bg-gray-600 rounded p-1">
                <ClockIcon className="inline w-4 h-4 mr-2" />Please wait for approval.
              </div>
            )}
            {selectedRequirement?.submission?.status === SubmissionStatus.Approved && (
              <div className="mt-4 text-center text-green-600 rounded p-1">
                <CheckBadgeIcon className="inline w-4 h-4 mr-2"/> Submission approved.
              </div>
            )}
            <div className="max-w-[700px] max-h-[calc(100vh-400px)] mt-4 shadow-lg border overflow-y-auto">
              <img src={!!selectedRequirement?.submission?.photo ? getURLForSubmission(selectedRequirement.submission.photo as string) : ''} alt="Submission" width={1000} height={1000} className="w-full h-full" />
            </div>
          </div>
        )}
        <div className="p-2 flex justify-end items-center mt-2">
          <button type="button" title="Close" className="border border-gray-500 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 font-[500]" onClick={onCloseModal}>Close</button>
        </div>
      </div>
    </Modal>
  </>)
}