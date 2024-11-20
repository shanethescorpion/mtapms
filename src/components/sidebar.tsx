'use client';
/* eslint-disable @next/next/no-img-element */
import { useSession } from "@app/lib/useSession";
import { AdminModel, ApplicationFormProps, Roles, StudentModel } from "@app/types";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import moment from "moment-timezone";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LoadingSpinnerFull } from "./loadings";

export interface SidebarContextProps {
  role?: Roles;
  setRole: (role: Roles) => void;
  toggleDrawer: () => void;
  openDrawer?: boolean;
  setOpenDrawer: (openDrawer: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextProps>({
  setRole: () => {},
  toggleDrawer: () => {},
  setOpenDrawer: () => {},
})

export function SidebarProvider({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [role, setRole] = useState<Roles|undefined>();
  const [openDrawer, setOpenDrawer] = useState<boolean>(true);
  const toggleDrawer = useCallback(() => {
    setOpenDrawer(!openDrawer);
  }, [openDrawer]);

  return (
    <SidebarContext.Provider
      value={{
        role,
        setRole,
        openDrawer,
        toggleDrawer,
        setOpenDrawer,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(
  props?: Readonly<{
    role?: Roles;
    defaultOpenDrawer?: boolean;
  }>
) {

  const { role, setRole, toggleDrawer, openDrawer, setOpenDrawer } = useContext(SidebarContext)

  useEffect(() => {
    if (props?.role !== undefined) {
      setRole(props.role);
    }
    if (props?.defaultOpenDrawer !== undefined) {
      setOpenDrawer(props.defaultOpenDrawer);
    }
    // eslint-disable-next-line
  }, [])

  return {
    role,
    setRole,
    toggleDrawer,
    openDrawer,
    setOpenDrawer,
  }
}

const sidebarLinks = {
  [Roles.Admin]: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      label: "Schedules",
      href: "/admin/schedule",
    },
    {
      label: "Requirement Management",
      href: "/admin/requirements",
    },
    {
      label: "Applications",
      href: "/admin/applications",
    },
    {
      label: "Scholar Information",
      href: "/admin/scholars",
    },
    {
      label: "Results",
      href: "/admin/results",
    },
    {
      label: "My Profile",
      href: "/admin/profile",
    },
    {
      label: "Account Settings",
      href: "/admin/settings",
    }
  ],
  [Roles.Applicant]: [
    {
      label: "Application Form",
      href: "/application",
    },
    {
      label: "Schedule and Result",
      href: "/schedule",
    },
    {
      label: "Documents",
      href: "/documents",
    },
    {
      label: "My Profile",
      href: "/profile",
    },
    {
      label: "Account Settings",
      href: "/settings",
    }
  ],
  [Roles.Grantee]: [
    {
      label: "Documents",
      href: "/grantee/documents",
    },
    {
      label: "My Profile",
      href: "/grantee/profile",
    },
    {
      label: "Account Settings",
      href: "/grantee/settings",
    }
  ],
  'none': []
}

function AdminAdditionalSidebar() {
  const pathname = usePathname()
  const [addSidebars, setAddSidebars] = useState<{ label: string, href: string }[]>([])
  const fetchAcademicYear = async () => {
    let additionalSidebars = []
    const url = new URL('/api/schedule/selected', window.location.origin)
    console.log (url)
    url.searchParams.set('sy', (new Date()).getFullYear().toString())
    const response = await fetch(url)
    if (response.ok) {
      const { data } = await response.json()
      console.log ("hh", data)
      if (!!data) {
        const dateNow = moment.tz('Asia/Manila').toDate()
        const orientationDate = moment(data.orientationDate).tz('Asia/Manila').toDate()
        dateNow.setHours(orientationDate.getHours(), orientationDate.getMinutes(), orientationDate.getSeconds(), orientationDate.getMilliseconds())
        if (dateNow.getTime() === orientationDate.getTime()) {
          additionalSidebars.push({
            label: 'Orientation Attendance',
            href: '/admin/orientation'
          })
        }
        const examDate = moment(data.examDate).tz('Asia/Manila').toDate()
        if (dateNow.getTime() >= examDate.getTime() && dateNow.getTime() <= examDate.getTime() + (1000 * 60 * 60 * 24 *   180)) {
          additionalSidebars.push({
            label: 'Exam Scores',
            href: '/admin/exam'
          })
        }
      }
    }
    setAddSidebars(additionalSidebars)
  }

  useEffect(() => {
    fetchAcademicYear()
  }, [])

  return addSidebars.length === 0 ? null : (
    <>
      {addSidebars.map((item, index) => (
        <Link key={index} href={item.href} className={
          clsx(
            "block w-[240px] ml-2 px-6 py-2 font-[700] text-[16px] hover:text-[#1D1D1D]",
            "cursor-pointer",
            pathname.startsWith(item.href) ? "text-[#00823E] border-l-[#00823E] border-l-4 rounded " : "text-[#1D1D1D]/50"
          )
        }>
          {item.label}
        </Link>
      ))}
    </>
  )
}

export function SidebarComponent({
  role: myRole,
  defaultOpenDrawer,
}: Readonly<{
  role: Roles;
  defaultOpenDrawer?: boolean;
}>) {

  const { data: sessionData, status, logout } = useSession({
    redirect: false
  });

  const pathname = usePathname()
  const { role, setRole, toggleDrawer, openDrawer, setOpenDrawer } = useSidebar({ role: myRole, defaultOpenDrawer })
  const [hiddenClass, sethiddenClass] = useState("left-0");
  const fullName = useMemo(() => role === Roles.Admin ? sessionData?.user?.firstName?.toUpperCase() + ' ' + sessionData?.user?.lastName?.toUpperCase() : sessionData?.user?.email, [sessionData, role])

  const [user, setUser] = useState<StudentModel & ApplicationFormProps | AdminModel>(sessionData?.user);

  const photoURL = useMemo(() => !!user ? (new URL('/api/user/photo/' + (user.photo || 'default'), window.location.origin)).toString() : '/api/user/photo/default', [user])

  const getUserData = useCallback(() => {
    if (sessionData?.user?._id) {
      if (role === Roles.Admin) {
        const url = new URL('/api/admin/profile/' + (sessionData?.user?._id), window.location.origin);
        fetch(url)
          .then(res => res.json())
          .then(({ data: userData }) => setUser(userData))
          .catch((e) => console.log(e))
      } else {
        const url = new URL('/api/scholarship/applications/profile/' + (sessionData?.user?._id), window.location.origin);
        fetch(url)
          .then(res => res.json())
          .then(({ data: userData }) => setUser(userData))
          .catch((e) => console.log(e))
      }
    }
  }, [sessionData?.user?._id, role]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useEffect(() => {
    if (openDrawer) {
      sethiddenClass("left-0");
    } else {
      setTimeout(() => sethiddenClass("-left-[270px]"), 400)
    }
  }, [openDrawer])

  return (
    <aside
      className={
        clsx(
          "h-screen",
          "transition-[transform] ease-in-out duration-300",
          "fixed top-0",
          "w-full md:w-[265px] md:max-w-[265px]",
          openDrawer ? "translate-x-[0] z-50" : "-translate-x-[265px]",
          hiddenClass,
        )
      }
    >
      {status === 'loading' && <LoadingSpinnerFull />}
      {status === 'authenticated' && (<>
        <div onClick={toggleDrawer} className={clsx(openDrawer ? "md:hidden absolute w-screen h-screen bg-black/25 cursor-pointer" : "hidden")} />
        <div className="relative w-[265px] max-w-[265px] h-full bg-[#F6FFF1] overflow-x-hidden overflow-h-auto">
          <div className="absolute top-5 right-5">
            <button type="button" className="md:hidden w-[30px] max-h-[30px] hover:bg-[#00823ECC] hover:text-gray-50 text-[#00823ECC] aspect-square rounded bg-gray-50 shadow  border" onClick={toggleDrawer} title={openDrawer ? "Close Sidebar" : "Open Sidebar"}>
              {openDrawer ? <ChevronLeftIcon fontSize={2} className="w-[30px]" /> : <ChevronRightIcon fontSize={2} className="w-[30px]" />}
            </button>
          </div>
          <div className="absolute top-[8%] right-0 w-0 h-[84%] rounded border-[3px] border-[#00823E]/15 z-0" />
          <Image src="/municipal-logo.svg" alt="Municipal Logo" width={85} height={85} priority={true} className="mx-auto py-10 rounded-full" />
          <div className="aspect-square w-[70px] h-[70px] mx-auto rounded-full overflow-hidden bg-white object-contain">
            <img src={photoURL} alt="Profile Image" width={200} height={200} className="w-auto h-auto bg-white" />
          </div>
          <h2 className="font-[700] text-[15px] leading-[36px] text-center text-[#1D1D1D] pb-2">{fullName}</h2>
          <div className="w-[100px] bg-[gold] capitalize font-[500] leading-[36px] text-[14px] rounded-2xl text-center mx-auto">{role}</div>
          <div className="h-[16px]" />
          <div className="min-h-[100px]">
            {/* sidebar links here */}
            { sidebarLinks[role || 'none'].map(({ label, href }, index) => (
              <Fragment key={index+"_sidebar_nav"}>
                { role === Roles.Admin && index === 4 && <AdminAdditionalSidebar />}
                <Link href={href} className={
                  clsx(
                    "block w-[240px] ml-2 px-6 py-2 font-[700] text-[16px] hover:text-[#1D1D1D]",
                    "cursor-pointer",
                    pathname.startsWith(href) ? "text-[#00823E] border-l-[#00823E] border-l-4 rounded " : "text-[#1D1D1D]/50"
                  )
                }>
                  {label}
                </Link>
              </Fragment>
            ))}
          </div>
          <div className="mx-auto text-center mt-6 hover:text-red-800 hover:font-semibold hover:underline">
            <button type="button" onClick={logout}>
              <span className="inline-flex w-[24px] h-[24px] aspect-square rounded-full bg-[#00823E] p-[6.5px] items-center justify-center">
                <Image src="/logout-icon.svg" alt="Log Out" width={24} height={24} priority={true} />
              </span>
              <span className="pl-1">Log Out</span>
            </button>
          </div>
          <div className="mt-6 w-full h-[1px]" />
        </div>
      </>)}
    </aside>
  )
}