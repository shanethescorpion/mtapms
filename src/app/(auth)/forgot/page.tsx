import { Metadata } from "next";
import { Poppins } from "next/font/google";
import ForgotComponent from "./component";

const poppins = Poppins({ weight: ['400', '500'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sign Up'
}

export default function SignupPage() {
  return (
    <div className={"min-w-full px-8 sm:px-auto sm:min-w-[438px] " + poppins.className}>
      <ForgotComponent />
    </div>
  )
}
