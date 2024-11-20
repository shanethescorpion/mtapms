import { isAuthenticated } from "@app/app/(auth)/_action/session";
import Footer from "@app/app/footer";
import { SessionProvider } from "@app/lib/useSession";
import { Roles } from "@app/types";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function AuthPageLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await isAuthenticated();
  if (auth) {
    redirect(auth === Roles.Applicant ? '/application' : '/' + auth);
  }
  return (
    <SessionProvider>
      <main className="lg:h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#0D41F8] lg:overflow-hidden">
        <div className="relative h-full flex items-center justify-center lg:gap-y-8 space-x-4 lg:space-x-0 lg:flex-col py-4 lg:p-0">
          <div className="z-0 w-[200px] h-full absolute -right-[100px] top-0 bg-black hidden lg:block">
            <div className="relative w-full h-full grid grid-rows-2">
              <div className="bg-[#0D41F8] z-0">
                <div className="absolute left-0 top-0 w-1/2 h-full rounded-br-full bg-[#0D41F8]" />
              </div>
              <div className="bg-[#F6FFF1]">
                <div className="absolute right-0 top-0 w-1/2 h-full rounded-tl-full bg-[#F6FFF1]" />
              </div>
            </div>
          </div>
          <div className="z-10 hidden lg:block w-[400px] h-[400px] xl:w-[600px] xl:h-[600px]">
            <Image className=" w-full h-full" src="/buena-logo.svg" alt="Municipal Logo" width={597} height={615} priority />
          </div>
          <h1 className="z-10 hidden lg:block uppercase font-[700] px-4 leading-[40.23px] text-center text-white w-fit text-[33px] drop-shadow-lg">
            MTAP MANAGEMENT SYSTEM
          </h1>
          <div className="grid grid-cols-3 gap-x-4 lg:hidden">
            <div className="z-10 w-[120px] h-[120px]">
              <Image className="w-full h-full" src="/buena-logo.svg" alt="Municipal Logo" width={597} height={615} priority />
            </div>
            <h1 className="z-10 uppercase font-[700] leading-[40.23px] text-left text-white text-[28px] w-[100px] drop-shadow-lg">
              MTAP MANAGEMENT SYSTEM
            </h1>
          </div>
        </div>
        <div className="min-h-[calc(100vh-155px)] h-full relative bg-[#F6FFF1] lg:bg-transparent">
          <div className="absolute hidden lg:block top-0 w-full h-full bg-[#F6FFF1] lg:left-[100px]" />
          <div className="*:z-10 h-full w-full flex flex-col items-center justify-center">
            {children}
            <footer className="bg-white/70 p-2 w-fit my-2 rounded-lg shadow lg:bg-transparent lg:shadow-none lg:m-0 lg:fixed lg:right-0 lg:bottom-5 lg:w-1/2">
              <Footer />
            </footer>
          </div>
        </div>
      </main>
    </SessionProvider>
  )
}