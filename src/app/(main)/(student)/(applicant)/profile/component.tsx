'use client';
/* eslint-disable @next/next/no-img-element */
import { displayFullName } from "@app/components/display";
import { LoadingSpinnerFull } from "@app/components/loadings";
import Toaster from "@app/components/toaster";
import { useSession } from "@app/lib/useSession";
import { ApplicationFormProps, StudentModel } from "@app/types";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Roboto } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { uploadPhoto } from "./action";

const roboto = Roboto({ weight: ["500", "700"], subsets: ["latin", "latin-ext"] });

export default function ProfilePage() {

  const { data: sessionData } = useSession({
    redirect: false
  });
  const [loading, setLoading] = useState<boolean>(true)
  const [photo, setPhoto] = useState<File>();
  const [user, setUser] = useState<StudentModel & ApplicationFormProps>(sessionData?.user);

  const photoURL = useMemo(() => !!user ? (new URL('/api/user/photo/' + (user.photo || 'default'), window.location.origin)).toString() : '/api/user/photo/default', [user])

  const getUserData = useCallback(async () => {
    if (!!sessionData?.user?._id) {
      setLoading(true)
      const url = new URL('/api/scholarship/applications/profile/' + (sessionData?.user?._id), window.location.origin);
      fetch(url)
        .then(res => res.json())
        .then(({ data }) => { setUser(data); setLoading(false) })
        .catch((e) => console.log(e))
    }
  }, [sessionData?.user?._id])

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  const upRef = useRef(null)
  const formRef = useRef<HTMLButtonElement>(null)

  const onUpdatePhoto = useCallback(() => {
    (upRef.current as any)?.click();
  }, [])

  const onChangePhoto = useCallback((e: any) => {
    setPhoto(e.target.files?.[0]);
    setTimeout(() => formRef.current?.click(), 500);
  }, [formRef])

  const onUpload = useCallback(async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (!photo) {
      Toaster.error('Please select a photo');
      return;
    }
    const formData = new FormData();
    formData.append('photo', photo, photo.name);
    const upload = uploadPhoto.bind(null, user!.photo as string);
    const { success, error } = await upload(formData)
    if (error) {
      Toaster.error(error);
    } else if (success) {
      Toaster.success(success);
      setTimeout(() => getUserData(), 100);
    }
  }, [photo, getUserData, user])

  return (
    <div className="p-6">
      <div className="text-4xl uppercase py-4 border-b-4 border-black text-black font-[700] mb-4">
        PROFILE INFORMATION
      </div>
      {/* Profile information */}
      <div className="w-[600px]">
        <div className="bg-[#FECB00] rounded-t-lg h-[103px] w-full"></div>
        <div className="relative bg-white">
          {loading ? <LoadingSpinnerFull /> : (<>
            <div className="absolute left-6 -top-[15%] flex gap-x-6">
              <button type="button" onClick={onUpdatePhoto} className="p-1 rounded-full aspect-square w-32 flex justify-center items-center bg-white border shadow even:*:hidden even:*:hover:block" title="upload">
                <img src={photoURL} width={200} height={200} alt="Photo" className="rounded-full aspect-square object-contain" />
                <ArrowTopRightOnSquareIcon className="absolute w-6 h-6 left-0 top-[82%] hover:text-[#606060] text-[#818181]" />
              </button>
              <form method="post" onSubmit={onUpload}>
                <input ref={upRef} type="file" id="photo" name="photo" accept="image/*" onChange={onChangePhoto} hidden />
                <button ref={formRef} type="submit" className="hidden" title="submit" />
              </form>
              <div className="pt-16 text-[#1D1D1D]">
                <h1 className="font-[700] uppercase pt-2">
                  {!!user?.firstName ? displayFullName(user as any, true) : '(Please fill up the application form first)'}
                </h1>
                <h4 className="text-xs font-[600]">
                  {user?.nameOfSchoolAttended}
                </h4>
              </div>
            </div>
            <div className="pt-20 px-8 pb-8">
              <div className="flex items-center mb-2">
                <div className="text-[#606060] font-[700] leading-[47.5px] min-w-36 pr-2">
                  Full Name
                </div>
                <div className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-[#D1D1D1] rounded-lg text-[15px]")}>
                  {!!user?.firstName ? displayFullName(user as any) : <>&nbsp;</>}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="text-[#606060] font-[700] leading-[47.5px] min-w-36 pr-2">
                  Address
                </div>
                <div className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-[#D1D1D1] rounded-lg text-[15px]")}>
                  {user?.presentAddress || <>&nbsp;</>}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="text-[#606060] font-[700] leading-[47.5px] min-w-36 pr-2">
                  Contact No.
                </div>
                <div className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-[#D1D1D1] rounded-lg text-[15px]")}>
                  {user?.mobileNo || <>&nbsp;</>}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="text-[#606060] font-[700] leading-[47.5px] min-w-36 pr-2">
                  Email Address
                </div>
                <div className={clsx(roboto.className, "text-[#1D1D1D] w-full px-4 py-1 border border-[#818181] bg-[#D1D1D1] rounded-lg text-[15px]")}>
                  {user?.email || <>&nbsp;</>}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="text-[#606060] font-[700] leading-[47.5px] min-w-36 pr-2">
                  Course
                </div>
                <div className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-[#D1D1D1] rounded-lg text-[15px]")}>
                  {user?.course || <>&nbsp;</>}
                </div>
              </div>
              {!!user?.studentId && (
                <div className="flex items-center mb-2">
                  <div className="text-[#606060] font-[700] leading-[47.5px] min-w-36 pr-2">
                    Student ID
                  </div>
                  <div className={clsx(roboto.className, "text-[#1D1D1D] uppercase w-full px-4 py-1 border border-[#818181] bg-[#D1D1D1] rounded-lg text-[15px]")}>
                    {user.studentId || <>&nbsp;</>}
                  </div>
                </div>
              )}
            </div>
          </>)}
        </div>
      </div>
    </div>
  )
}