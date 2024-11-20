import { Metadata } from "next";
import { Poppins } from "next/font/google";
import SignupComponent from "@app/app/(auth)/signup/component";

const poppins = Poppins({ weight: ['400', '500'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sign Up'
}

export default function SignupPage() {
  return (
    <div className={"min-w-full px-8 sm:px-auto sm:min-w-[438px] " + poppins.className}>
      <SignupComponent />
    </div>
  )
}
