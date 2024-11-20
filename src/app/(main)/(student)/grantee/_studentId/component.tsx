'use client'

import Buttons from "@app/components/buttons"
import Inputs from "@app/components/inputs"
import { Modal } from "@app/components/modals"
import { useSidebar } from "@app/components/sidebar"
import Toaster from "@app/components/toaster"
import { useSession } from "@app/lib/useSession"
import { Roles, StudentModel } from "@app/types"
import { useCallback, useEffect, useRef, useState } from "react"
import { addStudentId } from "./action"

export default function StudentIdModal() {
  const { data: sessionData, status, logout } = useSession({ redirect: false })
  const { toggleDrawer, openDrawer } = useSidebar({ role: Roles.Grantee })
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [data, setData] = useState<StudentModel>()
  const formRef = useRef<HTMLFormElement>(null)

  const getData = useCallback(async () => {
    if (status === 'authenticated' && !!sessionData?.user?._id) {
      const url = new URL('/api/user/student/' + sessionData.user._id, window.location.origin);
      fetch(url)
        .then(res => res.json())
        .then(({ data }) => setData(data))
        .catch((e) => console.log(e))
    }
  }, [status, sessionData?.user?._id])

  useEffect(() => {
    getData()
  }, [getData])

  useEffect(() => {
    if (!!data && data.isGrantee && !data.studentId) {
      if (openDrawer) {
        toggleDrawer()
      }
      setOpenModal(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onCloseModal = useCallback(() => {
    setOpenModal(false)
  }, [])

  const handleSubmit = useCallback(async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const formData = new FormData(e.target)
    const studentId = formData.get('studentId')
    if (!studentId) {
      Toaster.error('Please enter your student ID');
      return;
    }
    const updateStudentId = addStudentId.bind(null, studentId.toString().toUpperCase())
    const { success, error } = await updateStudentId()
    if (error) {
      Toaster.error(error);
    } else if (success) {
      Toaster.success(success);
      formRef.current?.reset();
      setOpenModal(false)
      setTimeout(() => getData(), 100);
    }
  }, [getData])

  return (
    <Modal title={<div className="pr-4">Congratulations! You are now a scholar grantee</div>} open={openModal} onClose={onCloseModal} showCloseButton={false} disableOutsideClick>
      <div className="max-w-[500px] mx-auto">
        <p>To continue, please provide your student ID. This will be used to verify your enrollment and grant you access to the scholarship program.</p>
        <form className="px-4 py-2" ref={formRef} onSubmit={handleSubmit}>
          <Inputs.SignupInput type="text" name="studentId" label="Student ID" placeholder="Student ID" iconSrc="/id-card.svg" inputClassName="uppercase" required />
          <br />
          <Buttons.SignupButton type="submit" label="Submit" />
        </form>
        <div className="my-4 w-fit mx-auto">
          <button type="button" onClick={logout} className="underline mx-auto font-[500]">Logout</button>
        </div>
      </div>
    </Modal>
  )
}