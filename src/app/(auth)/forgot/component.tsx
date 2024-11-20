'use client';
import { changePasswordAction, forgotAction, verifyForgotAction } from "@app/app/(auth)/_action/auth";
import Buttons from "@app/components/buttons";
import Inputs from "@app/components/inputs";
import Toaster from "@app/components/toaster";
import { ActionResponse } from "@app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

export default function ForgotComponent() {
  const router = useRouter()
  const [email, setEmail] = useState<string>("");
  const [arId, setArId] = useState<string>("");
  const [sq1, setSq1] = useState<string>("");
  const [sq2, setSq2] = useState<string>("");
  const [state, action] = useFormState(forgotAction, undefined)
  const forgotAction2 = useMemo(() => verifyForgotAction.bind(null, email, arId) as (prevState: ActionResponse, formData: any) => Promise<ActionResponse>, [email, arId]);
  const [state2, action2] = useFormState(forgotAction2, undefined);
  const forgotAction3 = useMemo(() => changePasswordAction.bind(null, email) as (prevState: ActionResponse, formData: any) => Promise<ActionResponse>, [email]);
  const [state3, action3] = useFormState(forgotAction3, undefined);
  const [step, setStep] = useState(1);
  const { pending } = useFormStatus()
  const formAction = useMemo(
    () => (
      step === 1
      ? action
      : step === 2
      ? action2
      : action3
  ), [step, action, action2, action3])

  useEffect(() => {
    if (!pending && !!state?.success) {
      if (!!state?.email && !!state?.arId) {
        setEmail(state.email || "");
        setArId(state.arId || "");
        setSq1(state.sq1 || "");
        setSq2(state.sq2 || "");
        setStep(2);
      } else {
        Toaster.error("Invalid Response from Server. Please Try Again Later.");
      }
    } else if (!pending && !!state?.error) {
      Toaster.error(state.error)
    }
  }, [state, pending])

  useEffect(() => {
    if (!pending && !!state2?.success) {
      setStep(3);
    } else if (!pending && !!state2?.error) {
      Toaster.error(state2.error)
    }
  }, [state2, pending])

  useEffect(() => {
    if (!pending && !!state3?.success) {
      setTimeout(() => {
        router.push("/")
      }, 500);
      Toaster.success(state3?.success);
    } else if (!pending && !!state3?.error) {
      Toaster.error(state3.error)
    }
  }, [state3, pending, router])

  return (
    <form className="mt-4 lg:m-0" action={formAction}>
      <h1 className="text-[#FBBC05] font-[500] text-[30px] leading-[45px]">Account Recovery</h1>
      <p className="text-[#004521] font-[400] text-[16px] leading-[24px] lg:mt-4">Do not have an account yet?</p>
      <p className="text-[#004521] font-[400] text-[16px] leading-[24px]">You can <Link href="/signup" className="text-blue-500 font-[600]">Sign Up here.</Link></p>
      <p className="text-[#004521] font-[400] text-[16px] leading-[24px]">Or you can <Link href="/signup" className="text-blue-500 font-[600]">Login</Link> to your account.</p>
      {step === 1 && (<>
        <h2 className="text-[#468966] font-[900] leading-[22.5px] text-[15px] mt-3  lg:mt-6">Forgot Password?</h2>
        <Inputs.SignupInput type="email" name="email" label="Email" iconSrc="/email.svg" placeholder="Enter email address" className="mt-2" required />
        <div className="mt-6 lg:mt-8 lg:mb-10">
          <Buttons.SignupButton type="submit" label="Next" />
        </div>
      </>)}
      {step === 2 && (<>
        <h2 className="text-[#468966] font-[900] leading-[22.5px] text-[15px] mt-3  lg:mt-6">Forgot Password?</h2>
        <div className="mt-3 text-black font-500 text-md">Secret Question #1: {sq1}</div>
        <Inputs.SignupInput type="text" name="sa1" iconSrc="" label="Secret Answer #1" placeholder="Secret Answer #1" className="mt-2" required />
        <div className="mt-3 text-black font-500 text-md">Secret Question #2: {sq2}</div>
        <Inputs.SignupInput type="text" name="sa2" iconSrc="" label="Secret Answer #1" placeholder="Secret Answer #1" className="mt-2" required />
        <div className="mt-6 lg:mt-8 lg:mb-10">
          <Buttons.SignupButton type="submit" label="Next" />
        </div>
      </>)}
      {step === 3 && (<>
        <h2 className="text-[#468966] font-[900] leading-[22.5px] text-[15px] mt-3  lg:mt-6">Change Password</h2>
        <div className="text-gray-600 italic text-sm">{}</div>
        <Inputs.SignupInput type="password" name="password" iconSrc="" label="Password" placeholder="Enter New Password" className="mt-2" required />
        <div className="mt-6 lg:mt-8 lg:mb-10">
          <Buttons.SignupButton type="submit" label="Change Password" />
        </div>
      </>)}
    </form>
  )
}