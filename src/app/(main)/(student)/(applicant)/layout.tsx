import { MainContainer } from "@app/components/main";
import { SidebarComponent } from "@app/components/sidebar";
import { Roles } from "@app/types";
import { redirect } from "next/navigation";
import { isAuthenticated } from "./auth";

export default async function ApplicantLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/')
  }
  return (
    <>
      <SidebarComponent role={Roles.Applicant} />
      <MainContainer>{children}</MainContainer>
    </>
  )
}