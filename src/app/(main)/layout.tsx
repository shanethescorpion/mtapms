import { isAuthenticated } from "@app/app/(auth)/_action/session";
import { SidebarProvider } from "@app/components/sidebar";
import { SessionProvider } from "@app/lib/useSession";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect('/');
  }
  return (
    <SessionProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </SessionProvider>
  )
}