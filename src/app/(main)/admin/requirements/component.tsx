'use client'

import Buttons from "@app/components/buttons";
import { LoadingSpinnerFull } from "@app/components/loadings";
import { Modal } from "@app/components/modals";
import { useSidebar } from "@app/components/sidebar";
import Tabs from "@app/components/tabs";
import Toaster from "@app/components/toaster";
import { RequirementModel, Roles, ScheduleModel } from "@app/types";
import { PlusIcon, XCircleIcon } from "@heroicons/react/16/solid";
import moment from "moment-timezone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { createRequirement, removeRequirement } from "./action";

export default function RequirementsPage() {
  const { openDrawer, toggleDrawer } = useSidebar({ role: Roles.Admin })
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
  const [schoolYear, setSchoolYear] = useState<number|string>(moment.tz('Asia/Manila').toDate().getFullYear())
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

  const [requirementData, setRequirementData] = useState<RequirementModel[]>([])
  const firstYearData = useMemo(() => requirementData.filter((item: RequirementModel) => item.forFirstYearOnly), [requirementData])
  const secondYearAboveData = useMemo(() => requirementData.filter((item: RequirementModel) => !item.forFirstYearOnly), [requirementData])

  const getRequirements = useCallback(() => {
    setLoading(true)
    const url = new URL('/api/scholarship/requirements', window.location.origin)
    url.searchParams.append('academicYear', schoolYear.toString())
    fetch(url)
      .then(response => response.json())
      .then(({ data }) => { setRequirementData(data); setLoading(false); })
      .catch(error => { console.log(error); setLoading(false); });
  }, [schoolYear])

  useEffect(() => {
    getRequirements()
  }, [getRequirements])

  const formRef = useRef<HTMLFormElement>(null)
  const [openCreate, setOpenCreate] = useState<'new'|'new_firstYear'|undefined>()

  const onOpenModal = useCallback((create: 'new'|'new_firstYear') => {
    if (openDrawer) {
      toggleDrawer()
    }
    setOpenCreate(create)
  }, [openDrawer, toggleDrawer])

  const onCloseModal = useCallback(() => {
    formRef.current?.reset()
    setOpenCreate(undefined)
  }, [])
  const addRequirementAction = useMemo(() => createRequirement.bind(null, scheduleId, openCreate === 'new_firstYear'), [scheduleId, openCreate])
  const [state, action, pending] = useFormState(addRequirementAction, undefined)

  useEffect(() => {
    if (!pending &&!!state?.success) {
      Toaster.success(state.success)
      formRef.current?.reset()
      setTimeout(getRequirements, 100)
      onCloseModal()
    } else if (!pending &&!!state?.error) {
      Toaster.error(state.error)
    }
  }, [state, pending, onCloseModal, getRequirements])

  const [openDelete, setOpenDelete] = useState<string|undefined>()
  const onDeleteRequirement = useCallback((id: string) => {
    if (openDrawer) {
      toggleDrawer()
    }
    setOpenDelete(id)
  }, [openDrawer, toggleDrawer])

  const onCloseDelete = useCallback(() => {
    setOpenDelete(undefined)
  }, [])

  const onConfirmDelete = useCallback(async () => {
    try {
      const deleteAction = removeRequirement.bind(null, openDelete!)
      const { success, error } = await deleteAction()
      if (error) {
        Toaster.error(error)
      } else if (success) {
        Toaster.success(success)
        setTimeout(getRequirements, 100)
      }
      onCloseDelete()
    } catch (e) {
      Toaster.error('Failed to delete requirement.')
    }
  }, [openDelete, getRequirements, onCloseDelete])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        Scholarship Requirement Management (A.Y. {schoolYear} - {parseInt(schoolYear as string) + 1})
      </div>
      <div className="mb-2">
        <label htmlFor="schoolYear" className="font-[500] text-[15px] mb-2 mr-2">Select Academic Year:</label>
        <select id="schoolYear" title="Academic Year" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} className="py-1 px-2 bg-white rounded text-center border border-black">
          {schoolYearList.map((sy: number) => (
            <option key={sy} value={sy}>A.Y. {sy} - {sy + 1}</option>
          ))}
        </select>
      </div>
      <Tabs.TabNav tabs={[{ label: 'For 1st Year Only', key: 'new_firstYear'}, { label: 'For 2nd year - 4th year', key: 'new' }]}>
        <Tabs.TabContent name="new_firstYear">
          <div className="w-full font-[500] text-[15px] min-w-[500px] text-black p-4">
            { loading && <LoadingSpinnerFull />}
            { !loading && firstYearData.length > 0 && (
              <div className="flex flex-col justify-between gap-y-8">
                <div className="flex flex-wrap justify-start items-start gap-x-8 flex-grow min-h-[400px] gap-y-6">
                  {firstYearData.map((item: RequirementModel, index: number) => (
                    <div key={"1st_" + index} className="flex flex-col min-h-[150px] min-w-72 max-w-sm border rounded-lg p-2 mx-auto bg-green-50 shadow-lg">
                      <div className="uppercase border-b text-center font-bold flex justify-between flex-nowrap pb-1">
                        <div className="flex-grow">{item.name}</div>
                        {Math.max(...schoolYearList) == schoolYear && (
                          <button type="button" className="text-red-500 hover:scale-150 hover:drop-shadow rounded aspect-square p-1" title="Remove Requirement" onClick={() => onDeleteRequirement(item._id!)}><XCircleIcon className="w-4 h-4 aspect-square" /></button>
                        )}
                      </div>
                      <div className="flex-grow px-3 py-1">{item.description}</div>
                    </div>
                  ))}
                </div>
                {Math.max(...schoolYearList) == schoolYear && (
                  <div className="w-full flex-shrink">
                    <div className="max-w-64 mx-auto"><Buttons.SignupButton type="button" label={<><PlusIcon className="inline w-5 h-5" /> <span>Add Requirement</span></>} onClick={() => onOpenModal('new_firstYear')} /></div>
                  </div>
                )}
              </div>
            )}
            { !loading && firstYearData.length === 0 && (
              <div className="flex flex-col min-h-[520px] w-full items-center justify-center text-2xl text-gray-500 italic gap-y-4">
                <div>No requirements setted for 1st year only scholars</div>
                {Math.max(...schoolYearList) == schoolYear && (
                  <div className="max-w-64"><Buttons.SignupButton type="button" label={<><PlusIcon className="inline w-5 h-5" /> <span>Add Requirement</span></>} onClick={() => onOpenModal('new_firstYear')} /></div>
                )}
              </div>
            )}
          </div>
        </Tabs.TabContent>
        <Tabs.TabContent name="new">
          <div className="w-full font-[500] text-[15px] min-w-[500px] text-black p-4">
            { loading && <LoadingSpinnerFull />}
            { !loading && secondYearAboveData.length > 0 && (
              <div className="flex flex-col justify-between gap-y-8">
                <div className="flex flex-wrap justify-start items-start gap-x-8 flex-grow min-h-[400px] gap-y-6">
                  {secondYearAboveData.map((item: RequirementModel, index: number) => (
                    <div key={"2nd_" + index} className="flex flex-col min-h-[150px] min-w-80 max-w-sm border rounded-lg p-2 mx-auto bg-green-50 shadow-lg">
                      <div className="uppercase border-b text-center font-bold flex justify-between flex-nowrap pb-1">
                        <div className="flex-grow">{item.name}</div>
                        {Math.max(...schoolYearList) == schoolYear && (
                          <button type="button" className="text-red-500 hover:scale-150 hover:drop-shadow rounded aspect-square p-1" title="Remove Requirement" onClick={() => onDeleteRequirement(item._id!)}><XCircleIcon className="w-4 h-4 aspect-square" /></button>
                        )}
                      </div>
                      <div className="flex-grow px-3 py-1">{item.description}</div>
                    </div>
                  ))}
                </div>
                {Math.max(...schoolYearList) == schoolYear && (
                  <div className="w-full flex-shrink">
                    <div className="max-w-64 mx-auto"><Buttons.SignupButton type="button" label={<><PlusIcon className="inline w-5 h-5" /> <span>Add Requirement</span></>} onClick={() => onOpenModal('new')} /></div>
                  </div>
                )}
              </div>
            )}
            { !loading && secondYearAboveData.length === 0 && (
              <div className="flex flex-col min-h-[520px] w-full items-center justify-center text-2xl text-gray-500 italic gap-y-4">
                <div>No requirements setted for 2nd year above scholars</div>
                {Math.max(...schoolYearList) == schoolYear && (
                  <div className="max-w-64"><Buttons.SignupButton type="button" label={<><PlusIcon className="inline w-5 h-5" /> <span>Add Requirement</span></>} onClick={() => onOpenModal('new')} /></div>
                )}
              </div>
            )}
          </div>
        </Tabs.TabContent>
      </Tabs.TabNav>
    </div>
    <Modal title={"Add Requirement for " + (openCreate === 'new' ? '2nd Year above' : '1st year only')} open={!!openCreate} onClose={onCloseModal}>
      <form ref={formRef} action={action} className="p-6 min-w-[500px]">
        <div className="mb-4">
          <label htmlFor="name" className="font-[600] text-[15px]">Requirement Name:</label>
          <input type="text" id="name" name="name" className="block py-1 px-2 bg-white rounded border border-black w-full" required />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="font-[600] text-[15px]">Description:</label>
          <textarea id="description" name="description" className="block py-1 px-2 bg-white rounded border border-black h-[100px] w-full" />
        </div>
        <div className="flex justify-end">
          <div className="min-w-32">
            <Buttons.SignupButton type="submit" label="Save" />
          </div>
        </div>
      </form>
    </Modal>
    <Modal title="Remove Requirement" open={!!openDelete} onClose={onCloseDelete}>
      <div className="p-6 text-center">
        <div>Are you sure you want to remove this requirement?</div>
        <div className="flex justify-end mt-4 gap-x-4">
          <button type="button" className="px-3 py-1 rounded-full border border-green-700 bg-green-700 hover:bg-green-600 text-white font-bold min-w-24" onClick={onConfirmDelete}>Yes, Remove it</button>
          <button type="button" className="px-3 py-1 rounded-full border border-gray-500 hover:bg-gray-200 min-w-24" onClick={onCloseDelete}>Cancel</button>
        </div>
      </div>
    </Modal>
  </>)
}