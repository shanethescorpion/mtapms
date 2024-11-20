'use client';
import { Modal } from "@app/components/modals";
import { useSidebar } from "@app/components/sidebar";
import Table, { TableColumnProps } from "@app/components/tables";
import Tabs from "@app/components/tabs";
import Toaster from "@app/components/toaster";
import { Roles } from "@app/types";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/16/solid";
import { useCallback, useEffect, useState } from "react";
import { attendOrientation } from "./action";
import moment from "moment-timezone";

const columns = (type: 'notAttended'|'attended', onAttended?: (rowData: any) => void): TableColumnProps[] => ([
  {
    label: 'Email',
    field: 'email',
    searchable: true,
    sortable: type === 'notAttended'
  },
  {
    label: 'Last Name',
    field: 'lastName',
    searchable: true,
    sortable: type === 'notAttended'
  },
  {
    label: 'First Name',
    field: 'firstName',
    searchable: true,
    sortable: type === 'notAttended'
  },
  {
    label: 'Middle Name',
    field: 'middleName',
    searchable: true,
    sortable: type === 'notAttended'
  },
  {
    label: 'Sex',
    field: 'sex',
    align: 'center',
    sortable: type === 'notAttended'
  },
  {
    label: 'Civil Status',
    field: 'civilStatus',
    align: 'center',
    sortable: type === 'notAttended'
  },
  {
    label: 'School',
    field: 'nameOfSchoolAttended',
    searchable: true,
    sortable: type === 'notAttended'
  },
  {
    label: 'School Sector',
    field: 'schoolSector',
    align: 'center',
    searchable: true,
    sortable: type === 'notAttended'
  },
] as TableColumnProps[]).concat((type === 'notAttended' ? [
  {
    label: 'Action',
    field: 'action',
    align: 'center',
    render(rowData: any) {
      return <button type="button" onClick={() => onAttended && onAttended(rowData)} title="Mark as Attended" className="bg-green-800 hover:bg-green-900 text-white rounded-full pl-2 pr-3 py-1"><CheckIcon className="inline w-4 h-4" />Mark as Attended</button>
    }
  }
] : []))

export default function OrientationAttendancePage() {
  const { toggleDrawer, openDrawer } = useSidebar({ role: Roles.Admin })
  const [loading, setLoading] = useState<boolean>(true)
  const [schoolYear, setSchoolYear] = useState<number>((moment.tz('Asia/Manila').toDate()).getFullYear())

  const [notAttended, setNotAttended] = useState<any[]>([])
  const [attended, setAttended] = useState<any[]>([])
  const [selectedAttendance, setSelectedAttendance] = useState<any>()

  const fetchAttendance = useCallback(async (attended: boolean = false) => {
    const url = new URL('/api/orientation', window.location.origin)
    url.searchParams.append('academicYear', schoolYear.toString())
    url.searchParams.append('action', attended ? 'attended' : 'notAttended')
    const response = await fetch(url)
    if (response.ok) {
      const { data } = await response.json()
      if (attended) {
        setAttended(data)
      } else {
        setNotAttended(data)
      }
    }
  }, [schoolYear])

  const fetchRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await fetchAttendance()
    } catch(e) {
      console.log(e)
    }
    try {
      await fetchAttendance(true)
    } catch (e) {
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

  const onCloseModal = useCallback(() => setSelectedAttendance(null), [])

  const onAttended = useCallback(async (rowData: any) => {
    try {
      const attend = attendOrientation.bind(null, schoolYear, rowData._id)
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
  }, [schoolYear, fetchRefresh, onCloseModal])

  const onOpenModal = useCallback((rowData: any) => {
    if (openDrawer) {
      toggleDrawer()
    }
    setSelectedAttendance(rowData)
  }, [openDrawer, toggleDrawer])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        SCHOLARSHIP APPLICATIONS (A.Y. {schoolYear} - {schoolYear + 1})
      </div>
      <div className="text-right">
        <button type="button" className="bg-green-700 hover:bg-green-600 text-white rounded-full px-4 py-2 mr-2 mb-2" onClick={fetchRefresh}>
          <ArrowPathIcon className="w-4 h-4 inline mr-1" />Refresh
        </button>
      </div>
      <Tabs.TabNav tabs={[{ key: 'notAttended', label: 'Not Attended' }, { key: 'attended', label: 'Attended' }]} defaultSelectedTab="notAttended">
        <Tabs.TabContent name="notAttended">
          {/* Not attended yet */}
          <div className="overflow-y-auto max-h-[520px] min-h-[520px]">
            <Table columns={columns('notAttended', onOpenModal)} loading={loading} data={notAttended} searchable toolbars={[<div key="titlekey" className="xl:absolute xl:left-0 xl:top-0 h-fit w-full xl:pt-3 text-center text-white drop-shadow-lg uppercase font-bold text-xl z-0">Not Attended Yet</div>]}/>
          </div>
        </Tabs.TabContent>
        <Tabs.TabContent name="attended">
          {/* Attended */}
          <div className="overflow-y-auto max-h-[520px] min-h-[520px]">
            <Table columns={columns('attended')} loading={loading} data={attended} searchable toolbars={[<div key="titlekey" className="xl:absolute xl:left-0 xl:top-0 h-fit w-full xl:pt-3 text-center text-white drop-shadow-lg uppercase font-bold text-xl">Attended</div>]}/>
          </div>
        </Tabs.TabContent>
      </Tabs.TabNav>
    </div>
    <Modal title="Attend?" onClose={onCloseModal} open={!!selectedAttendance}>
      <div className="p-6">
        <div className="text-xl font-bold">Are you sure you want to mark <strong>{selectedAttendance?.firstName} {selectedAttendance?.lastName}</strong> ({selectedAttendance?.email}) as Attended?</div>
        <div className="mt-4">
          <button type="button" className="bg-blue-800 hover:bg-blue-900 text-white rounded-full px-4 py-2" onClick={() => onAttended(selectedAttendance)}>Mark as Attended</button>
          <button type="button" className="ml-4 text-gray-600 hover:text-gray-900 border border-gray-600 rounded-full px-4 py-2" onClick={onCloseModal}>Cancel</button>
        </div>
      </div>
    </Modal>
  </>)
}