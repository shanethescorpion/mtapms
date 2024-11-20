'use client';;
import Footer from "@app/app/footer";
import { useSidebar } from "@app/components/sidebar";
import { useSession } from "@app/lib/useSession";
import { Roles } from "@app/types";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import Image from "next/image";
import { redirect, usePathname } from "next/navigation";
import { LoadingSpinnerFull } from "./loadings";

export function MainContainer({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status, role } = useSession({
    redirect: true
  })
  const pathname = usePathname()
  const { openDrawer, toggleDrawer } = useSidebar({ role: role })

  if (status === 'authenticated' && !pathname.startsWith('/' + Roles.Admin) && role === Roles.Admin) {
    redirect('/' + role);
  } else if (status === 'authenticated' && !pathname.startsWith('/' + Roles.Grantee) && role === Roles.Grantee) {
    redirect('/' + role);
  } else if (status === 'authenticated' && (pathname.startsWith('/' + Roles.Applicant) || pathname.startsWith('/' + Roles.Grantee)) && role === Roles.Applicant) {
    redirect('/application');
  }
  return (
    <main className={
      clsx(
        "relative min-h-screen max-h-screen bg-[#F6FFF1]",
        "transition-[padding-left] ease-in-out duration-300",
        "overflow-y-auto",
        openDrawer ? "md:pl-[265px]" : "pl-0",
      )
    }>
      {status === 'loading' && <LoadingSpinnerFull />}
      {status === 'authenticated' && (<>
        <header className="flex items-center justify-between p-4 relative">
          <button type="button" className="w-[30px] max-h-[30px] hover:bg-[#00823ECC] hover:text-gray-50 text-[#00823ECC] aspect-square rounded bg-gray-50 shadow  border" onClick={toggleDrawer} title={openDrawer ? "Close Sidebar" : "Open Sidebar"}>
            {openDrawer ? <ChevronLeftIcon fontSize={2} className="w-[30px]" /> : <ChevronRightIcon fontSize={2} className="w-[30px]" />}
          </button>
          <div className="ml-4 flex items-center justify-center space-x-2 flex-grow text-[12px] font-[400] md:text-[16px] md:leading-[36px] md:text-center">
            { !openDrawer &&  (
              <div className="min-w-[50px] min-h-[50px]">
                <Image src="/buena-logo.svg" alt="Municipal Logo" width={50} height={50} priority={true} />
              </div>
            )}
            <div className="max-w-[300px] md:max-w-none">MUNICIPAL TERTIARY ASSISTANCE PROGRAM MANAGEMENT SYSTEM</div>
          </div>
        </header>
        <div className="p-2">
          <div className="block min-h-[calc(100vh-145px)] w-full">
            {children}
          </div>
          <footer className="bg-white/70 p-2 w-fit mx-auto my-2 rounded-lg shadow lg:bg-transparent lg:shadow-none">
            <Footer />
          </footer>
        </div>
      </>)}
    </main>
  )
}