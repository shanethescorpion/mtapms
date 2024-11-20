'use client';

import AnimatedIcons from "@app/components/icons/animated";
import { useMemo } from "react";
import { useFormStatus } from "react-dom";

export function AuthButton({
  type = 'button',
  label = '',
  isLoading = false,
  onClick,
  disabled,
  ...props
}: Readonly<{
  type?: "button" | "submit" | "reset";
  label: string | React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}>) {
  const { pending } = useFormStatus()
  const loading = useMemo(() => type === 'submit' ? pending : isLoading, [pending, type, isLoading])
  return <button type={type} onClick={onClick} className="disabled:bg-gray-200 disabled:text-gray-300 bg-[#0F8346] hover:bg-green-600 text-white h-[67px] leading-[29.26px] text-[24px] font-[700] p-4 rounded-2xl" disabled={loading || disabled} {...props}>{!loading ? label : <AnimatedIcons.Spinner className="w-full flex justify-center items-center" />}</button>
}

export function SignupButton({
  type = 'button',
  label = '',
  isLoading = false,
  onClick,
  ...props
}: Readonly<{
  type?: "button" | "submit" | "reset";
  label: string | React.ReactNode;
  isLoading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}>) {
  const { pending } = useFormStatus()
  const loading = useMemo(() => type === 'submit' ? pending : isLoading, [pending, type, isLoading])
  return <button type={type} onClick={onClick} className="disabled:bg-gray-200 disabled:text-gray-300 bg-[#FBBC05] hover:bg-yellow-300 text-[#004521] leading-[25.5px] text-[17px] font-[500] p-4 rounded-[32px] shadow-lg w-full" disabled={loading} {...props}>{!loading ? label : <AnimatedIcons.Spinner className="w-full flex justify-center items-center" />}</button>
}

const Buttons = {
  AuthButton,
  SignupButton,
}

export default Buttons