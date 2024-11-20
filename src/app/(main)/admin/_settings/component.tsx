'use client'

import Buttons from "@app/components/buttons";
import Toaster from "@app/components/toaster";
import { useSession } from "@app/lib/useSession";
import clsx from "clsx";
import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { changeName, changePass } from "./action";

const roboto = Roboto({ weight: ["500", "700"], subsets: ["latin", "latin-ext"] });

export default function AccountSettingsComponent() {
  const { data: sessionData, refresh, update } = useSession({ redirect: false })
  const router = useRouter()
  const [name, setName] = useState<{
    firstName: string;
    lastName: string;
  }>({
    firstName: sessionData?.user?.firstName || '',
    lastName: sessionData?.user?.lastName || '',
  })
  const [password, setPassword] = useState<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = useCallback(async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (password.newPassword !== password.confirmPassword) {
      Toaster.error('New password and confirmation password do not match');
      return;
    }
    const updatePassword = changePass.bind(null, password.oldPassword, password.newPassword);
    const { success, error } = await updatePassword()
    if (error) {
      Toaster.error(error)
    } else if (success) {
      Toaster.success(success)
      setPassword({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => {
        update()
      }, 100);
      setTimeout(() => {
        refresh()
      }, 500);
      setTimeout(() => {
        router.refresh()
      }, 1000);
    }
  }, [password, refresh, router, update])

  const handleNameSubmit = useCallback(async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const updateName = changeName.bind(null, name.firstName, name.lastName);
    const { success, error } = await updateName()
    if (error) {
      Toaster.error(error)
    } else if (success) {
      Toaster.success(success)
      setTimeout(() => {
        update()
      }, 100);
      setTimeout(() => {
        refresh()
      }, 500);
      setTimeout(() => {
        router.refresh()
      }, 1000);
    }
  }, [name, refresh, router, update])

  useEffect(() => {
    setName({
      firstName: sessionData?.user?.firstName || '',
      lastName: sessionData?.user?.lastName || '',
    })
  }, [sessionData?.user?.firstName, sessionData?.user?.lastName])

  return (<>
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        ACCOUNT SETTINGS
      </div>
      {/* Account Settings - profile */}
      <div className="w-[600px] mb-4">
        <div className="bg-[#FECB00] rounded-t-lg py-6 w-full text-2xl font-[500] px-8 p-4">Change Name</div>
        <div className="relative bg-white">
          <form onSubmit={handleNameSubmit} className="pt-4 px-8 pb-8">
            <div className="flex items-center mb-2">
              <label htmlFor="firstName" className="text-[#606060] font-[700] leading-[47.5px] min-w-48 pr-2">
                First Name
              </label>
              <input type="text" id="firstName" value={name.firstName} onChange={(e) => setName({...name, firstName: e.target.value.toUpperCase() })} className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-white rounded-lg text-[15px]")} required />
            </div>
            <div className="flex items-center mb-2">
              <label htmlFor="lastName" className="text-[#606060] font-[700] leading-[47.5px] min-w-48 pr-2">
                Last Name
              </label>
              <input type="text" id="lastName" value={name.lastName} onChange={(e) => setName({...name, lastName: e.target.value.toUpperCase() })} className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-white rounded-lg text-[15px]")} required />
            </div>
            <div className="max-w-64 mx-auto mt-4">
              <Buttons.SignupButton type="submit" label="Change Admin Name" />
            </div>
          </form>
        </div>
      </div>
      {/* Account Settings - change password */}
      <div className="w-[600px]">
        <div className="bg-[#FECB00] rounded-t-lg py-6 w-full text-2xl font-[500] px-8 p-4">Change Password</div>
        <div className="relative bg-white">
          <form onSubmit={handleSubmit} className="pt-4 px-8 pb-8">
            <div className="flex items-center mb-2">
              <label htmlFor="oldPassword" className="text-[#606060] font-[700] leading-[47.5px] min-w-48 pr-2">
                Old Password
              </label>
              <input type="password" id="oldPassword" value={password.oldPassword} onChange={(e) => setPassword({...password, oldPassword: e.target.value })} className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-white rounded-lg text-[15px]")} required />
            </div>
            <div className="flex items-center mb-2">
              <label htmlFor="newPassword" className="text-[#606060] font-[700] leading-[47.5px] min-w-48 pr-2">
                New Password
              </label>
              <input type="password" id="newPassword" value={password.newPassword} onChange={(e) => setPassword({...password, newPassword: e.target.value })} className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-white rounded-lg text-[15px]")} required />
            </div>
            <div className="flex items-center mb-2">
            <label htmlFor="confirmPassword" className="text-[#606060] font-[700] leading-[47.5px] min-w-48 pr-2">
                Confirm Password
              </label>
              <input type="password" id="confirmPassword" value={password.confirmPassword} onChange={(e) => setPassword({...password, confirmPassword: e.target.value })} className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-white rounded-lg text-[15px]")} required />
            </div>
            <div className="max-w-64 mx-auto mt-4">
              <Buttons.SignupButton type="submit" label="Change Password" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </>)
}