'use client';;
import { signupAction } from "@app/app/(auth)/_action/auth";
import Buttons from "@app/components/buttons";
import Inputs, { SelectOptions } from "@app/components/inputs";
import Toaster from "@app/components/toaster";
import { SecretQuestions1, SecretQuestions2 } from "@app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";


export default function SignupComponent() {
  const router = useRouter()
  const [state, action, pending] = useFormState(signupAction, undefined)

  useEffect(() => {
    if (!pending && !!state?.success) {
      setTimeout(() => router.push('/'), 500)
      Toaster.success(state.success)
    } else if (!pending && !!state?.error) {
      Toaster.error(state.error)
    }
  }, [state, pending, router])

  return (
    <form className="mt-4 lg:m-0" action={action}>
      <h1 className="text-[#FBBC05] font-[500] text-[30px] leading-[45px]">Sign Up</h1>
      <p className="text-[#004521] font-[400] text-[16px] leading-[24px] lg:mt-4">If you already have an account,</p>
      <p className="text-[#004521] font-[400] text-[16px] leading-[24px]">You can <Link href="/" className="text-[#FBBC05] font-[600]">Login here.</Link></p>
      <h2 className="text-[#468966] font-[900] leading-[22.5px] text-[15px] mt-3  lg:mt-6">ACCOUNT REGISTRATION</h2>
      <Inputs.SignupInput type="email" name="email" label="Email" iconSrc="/email.svg" placeholder="Enter your email address" className="mt-2" required />
      <Inputs.SignupInput type="password" name="password" label="Password" iconSrc="/padlock.svg" placeholder="Enter your Password" className="mt-3" required />
      <Inputs.SignupInput type="password" name="confirmPassword" label="Confirm Password" iconSrc="/padlock.svg" placeholder="Re-enter your Password" className="mt-3" required />
      <Inputs.SignupSelect options={[...Object.entries(SecretQuestions1).map(([_, v]) => ({ label: v, value: v } as SelectOptions))]} name="sq1" label="Secret Question #1" placeholder="Select a question" className="mt-3" required />
      <Inputs.SignupInput name="sa1" label="Secret Answer #1" iconSrc="" placeholder="Enter Secret Answer #1" className="mt-2" required />
      <Inputs.SignupSelect options={[...Object.entries(SecretQuestions2).map(([_, v]) => ({ label: v, value: v } as SelectOptions))]} name="sq2" label="Secret Question #2" placeholder="Select a question" className="mt-3" required />
      <Inputs.SignupInput name="sa2" label="Secret Answer #2" iconSrc="" placeholder="Enter Secret Answer #12" className="mt-2" required />
      <div className="mt-6 lg:mt-8 lg:mb-10">
        <Buttons.SignupButton type="submit" label="Register" />
      </div>
    </form>
  );
}