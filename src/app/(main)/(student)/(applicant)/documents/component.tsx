'use client';
/* eslint-disable @next/next/no-img-element */
import { LoadingSpinner } from "@app/components/loadings";
import { Modal } from "@app/components/modals";
import { useSidebar } from "@app/components/sidebar";
import Toaster from "@app/components/toaster";
import { useSession } from "@app/lib/useSession";
import {
  RequirementModel,
  RequirementSubmissionModel,
  Roles,
  ScheduleModel,
  StudentModel,
  SubmissionStatus,
  YearLevel,
} from "@app/types";
import { CheckBadgeIcon, ClockIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import moment from "moment-timezone";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uploadSubmission } from "./action";

export default function DocumentRequirementsPage() {
  const { data: sessionData, status } = useSession({ redirect: false })
  const { toggleDrawer, openDrawer } = useSidebar({ role: Roles.Applicant });
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<StudentModel>();

  const [syData, setSYData] = useState<ScheduleModel>()

  const schoolYear = useMemo<number|string|undefined>(() => syData?.academicYear, [syData])
  const [requirements, setRequirements] = useState<RequirementModel[]>([]);

  const getSYData = async () => {
    setLoading(true)
    const url = new URL('/api/schedule/now', window.location.origin)
    url.searchParams.append('action', 'documents')
    const response = await fetch(url)
    if (response.ok) {
      const { data: d } = await response.json()
      setSYData(d)
      setLoading(false)
      return d.academicYear
    }
    return ''
  }

  const fetchData = useCallback(async (sy: string|number) => {
    setLoading(true)
    let student = null
    try {
      const url = new URL('/api/scholarship/applications', window.location.origin)
      url.searchParams.append('studentId', sessionData.user._id)
      url.searchParams.append('academicYear', schoolYear?.toString() || sy.toString())
      const response = await fetch(url)
      if (response.ok) {
        const { data: st } = await response.json()
        student = st
      }
    } catch (e) {}
    try {
      const url = new URL('/api/scholarship/requirements', window.location.origin)
      url.searchParams.append('academicYear', schoolYear?.toString() || sy.toString())
      url.searchParams.append('firstYearOnly', student?.yearLevel == YearLevel.FirstYear ? "true" : "false")
      const response = await fetch(url)
      if (response.ok) {
        const { data: req } = await response.json()
        setRequirements(req)
      }
    } catch (e) {}
    try {
      const url = new URL('/api/scholarship/grantees', window.location.origin)
      url.searchParams.append('academicYear', schoolYear?.toString() || sy?.toString())
      url.searchParams.append('type', student?.yearLevel == YearLevel.FirstYear ? "applicant_firstYear" : "applicant")
      const response = await fetch(url)
      if (response.ok) {
        const { data: d } = await response.json()
        setData(d);
      }
    } catch (e) {}
    setLoading(false)
  }, [sessionData.user._id, schoolYear])

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

  const getRequirementSubmissionFromId = useCallback((reqId?: string): RequirementSubmissionModel|undefined =>
    !reqId ? undefined : (data?.applicationSubmission as RequirementSubmissionModel[])
      ?.find((rs: RequirementSubmissionModel) => (rs.requirementId as RequirementModel)?._id?.toString() === reqId)
  , [data])

  const formRef = useRef<HTMLFormElement>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<(RequirementModel & { submission?: RequirementSubmissionModel })|undefined>();

  const onSelectedRequirement = useCallback((req: RequirementModel & { submission?: RequirementSubmissionModel }) => {
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
    const upload = uploadSubmission.bind(null, selectedRequirement!._id!)
    const { success, error } = await upload(formData)
    if (error) {
      Toaster.error(error)
    } else if (success) {
      Toaster.success(success)
      refreshData()
      formRef.current?.reset();
      setTimeout(() => onCloseModal(), 100);
    }
  }, [fileSubmission, selectedRequirement, onCloseModal, refreshData])

  const getURLForSubmission = useCallback((photoId?: string) => (new URL("/api/user/photo/" + photoId, window.location.origin)).toString(), [])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        DOCUMENTS REQUIREMENTS
      </div>
      <div className="flex flex-wrap justify-start items-start gap-4 p-4">
        { loading && <LoadingSpinner /> }
        {/* Document cards */}
        { !loading && requirements.map((req: RequirementModel) => (
          <button key={req._id} type="button" onClick={() => onSelectedRequirement({...req, submission: getRequirementSubmissionFromId(req._id) })} className={clsx("relative w-[200px] bg-[#F9F9F9] border rounded-lg shadow-md p-6", selectedRequirement?._id === req._id ? 'bg-yellow-100' : '')} title={!getRequirementSubmissionFromId(req._id) ? 'Submission needed' : getRequirementSubmissionFromId(req._id)!.status}>
            <ExclamationCircleIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-yellow-500", !getRequirementSubmissionFromId(req._id) ? '' : 'hidden')} />
            <ClockIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-gray-500", getRequirementSubmissionFromId(req._id)?.status === SubmissionStatus.Pending ? '' : 'hidden')} />
            <CheckBadgeIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-green-500", getRequirementSubmissionFromId(req._id)?.status === SubmissionStatus.Approved ? '' : 'hidden')} />
            <XCircleIcon className={clsx("absolute top-2 right-2 w-10 h-10 text-red-500", getRequirementSubmissionFromId(req._id)?.status === SubmissionStatus.Disapproved ? '' : 'hidden')} />
            <div className="w-fit mx-auto">
              <Image src="/doc-icon.svg" alt="Document Icon" width={150} height={150} />
            </div>
            <div className="text-lg font-bold w-full text-center pt-3 border-b">{req.name}</div>
            <p className="text-xs w-full text-start pt-1">{req.description}</p>
          </button>
        ))}
        { !loading && requirements.length === 0 && <div className="text-center text-gray-500">Nothing to submit here.</div> }
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
                Last update: {(moment(selectedRequirement?.submission?.updatedAt!)).tz('Asia/Manila').toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}
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
              Last update: {(moment(selectedRequirement?.submission?.updatedAt!)).tz('Asia/Manila').toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}
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