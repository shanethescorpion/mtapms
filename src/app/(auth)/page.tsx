import { Metadata } from "next";
import LoginTabComponent from "@app/app/(auth)/_login/component";

export const metadata: Metadata = {
  title: 'Login'
}

export default function LoginPage() {
  return <LoginTabComponent />
}
