'use client';;
import { loginAction } from "@app/app/(auth)/_action/auth";
import Buttons from "@app/components/buttons";
import Inputs from "@app/components/inputs";
import Tabs, { type TabNavTabsProp } from "@app/components/tabs";
import Toaster from "@app/components/toaster";
import { useSession } from "@app/lib/useSession";
import { Roles } from "@app/types";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";

export default function LoginTabComponent() {
  const { status, role, refresh } = useSession({
    redirect: false
  });

  useEffect(() => {
    if (status === 'authenticated') {
      switch (role) {
        case Roles.Applicant: redirect('/application');
        case Roles.Grantee:
        case Roles.Admin: redirect('/' + role)
        default: // do nothing
      }
    }
  }, [status, role]);

  const router = useRouter();
  const tabs = useMemo<TabNavTabsProp[]>(() => [
    { label: 'Student', key: 'student' },
    { label: 'Admin', key: 'admin' }
  ], [])
  const [selected, setSelected] = useState<string|undefined>(tabs?.[0]?.key)

  const [state, action] = useFormState(loginAction, {
    success: false,
  })

  useEffect(() => {
    if (state.success) {
      refresh();
      Toaster.success("Logged In Successfully")
    } else if (state.error?.login) {
      Toaster.error(state.error.login)
    }
    // eslint-disable-next-line
  }, [state])


  return (
    <Tabs.AuthTabNav
      tabs={tabs}
      defaultSelectedTab={"admin"}
      selectedTab={selected}
      onSelectedTab={setSelected}
    >
      {tabs.map(({label, key}) => (
        <Tabs.TabContent key={key} name={key}>
          <div className="pt-12 px-12 pb-8">
            <h1 className="text-[#0F8346] text-[28px] uppercase font-[800] leading-[34.13px] text-center mb-1">LOG IN YOUR ACCOUNT</h1>
            <p className="text-[#0F8346] text-[16px] font-[400] leading-[19.5px] mb-6 text-center">Effortlessly request documents online</p>
            <p className="text-[#0F8346] text-[20px] font-[700] leading-[19.5px] mb-4 text-center">{label} Access</p>
            <form action={action} className="flex flex-col gap-y-8 flex-nowrap h-full">
              <input type="hidden" name="loginas" value={key} />
              <Inputs.AuthInput name={key === "admin" ? "employeeId" : "email"} label={key === "admin" ? "Employee ID" : "Email"} />
              <Inputs.AuthInput type="password" name="password" label="Password" />
              <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-y-0 sm:gap-x-6">
                <Buttons.AuthButton type="submit" label="Login" />
                <Buttons.AuthButton label="Sign Up" onClick={() => router.push('/signup')} disabled={key === "admin"} />
              </div>
            </form>
            {/* Forgot Password link /forgot */}
            <div className="flex justify-center  mt-4">
              <Link href="/forgot" className="text-[#0F8346] text-[16px] font-[400] leading-[19.5px] hover:text-[#0F8346] hover:underline">Forgot Password?</Link>
            </div>
          </div>
        </Tabs.TabContent>
      ))}
    </Tabs.AuthTabNav>
  )
}