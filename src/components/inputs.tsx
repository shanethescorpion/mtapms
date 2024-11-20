'use client'

import clsx from "clsx";
import Image from "next/image";
import { HTMLInputTypeAttribute, useState } from "react";

export function AuthInput({
  name,
  label,
  type = 'text',
  placeholder,
}: Readonly<{
  name?: string;
  label?: string;
  type?: HTMLInputTypeAttribute,
  placeholder?: string;
}>) {
  return (
    <div>
      {!!label && <label htmlFor={name} className="text-[#00823E] text-[22px] font-[600] leading-[26.82px] mb-2">{label}</label> }
      <input type={type} id={name} name={name} placeholder={placeholder} title={label} className="mt-1 h-[57px] w-full rounded-[12px] border-[2px] border-[#0F8346] outline-green-500 text-[#468966B2] px-4 font-[500] text-[20px] leading-[24.38px]" />
    </div>
  )
}

export function SignupInput({
  name,
  label,
  type = 'text',
  iconSrc = "/email.svg",
  placeholder,
  className,
  inputClassName,
  required,
  disabled,
}: Readonly<{
  name?: string;
  label?: string;
  iconSrc?: string;
  type?: HTMLInputTypeAttribute,
  placeholder?: string;
  className?: string;
  inputClassName?: string,
  required?: boolean;
  disabled?: boolean;
}>) {
  const [viewable, setViewable] = useState<boolean>(false);
  const toggleViewable = () => {
    setViewable(!viewable);
  }
  return (
    <div className={className}>
      <div className="flex flex-col flex-nowrap justify-start items-start">
      {!!label && <label htmlFor={name} className="font-[500] text-[13px] leading-[19.5px] text-[#004521]">{label}</label> }
        <div className="relative w-full">
          {!!iconSrc && (
            <div className="absolute left-[6px] top-[8px] w-[17px] h-[17px] z-0">
              <Image src={iconSrc} alt={label + ' Icon'} width={20} height={20} />
            </div>
          )}
          <input type={type === "password" && viewable ? "text" : type} required={required} disabled={disabled} name={name} id={name} placeholder={placeholder} className={clsx("w-full bg-transparent text-[16px] font-[400] leading-[24px] text-[#004521] placeholder:text-[#00452188] focus:bg-white/30 focus:rounded-sm py-[5px] pl-[32px] pr-2 outline-none focus:border-b-[#FBBC05] border-b-[2px] border-b-[#004521]", inputClassName)} />
          { type === "password" && (
            <button type="button" title={viewable ? "Hide Password" : "Show Password"} onClick={toggleViewable} className="text-[#004521] absolute right-[6px] top-[8px] w-[17px] h-[17px]">
              <Image src={viewable ? '/visible.svg' : '/invisible.svg'} alt={'View Icon'} width={20} height={20} className="text-[#004521]" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export interface SelectOptions {
  label: string
  value: any
}

export function SignupSelect({
  name,
  label,
  options = [],
  placeholder,
  className,
  selectClassName,
  required,
  disabled,
}: Readonly<{
  name?: string;
  label?: string;
  options: SelectOptions[],
  placeholder?: string;
  className?: string;
  selectClassName?: string,
  required?: boolean;
  disabled?: boolean;
}>) {
  return (
    <div className={className}>
      <div className="flex flex-col flex-nowrap justify-start items-start">
      {!!label && <label htmlFor={name} className="font-[500] text-[13px] leading-[19.5px] text-[#004521]">{label}</label> }
        <div className="relative w-full">
          <select name={name} id={name} required={required} disabled={disabled} className={clsx("w-full bg-transparent text-[16px] font-[400] leading-[24px] text-[#004521] placeholder:text-[#00452188] focus:bg-white/30 focus:rounded-sm py-[5px] pl-[32px] pr-2 outline-none focus:border-b-[#FBBC05] border-b-[2px] border-b-[#004521]", selectClassName)}>
            {!!placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

const Inputs = {
  AuthInput,
  SignupInput,
  SignupSelect
}

export default Inputs