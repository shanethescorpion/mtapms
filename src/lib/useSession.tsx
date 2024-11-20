'use client';
import { destroySession, updateSession } from "@app/lib/session";
import { AuthenticationStatus, Roles } from "@app/types";
import { type JWTPayload } from "jose";
import moment from "moment-timezone";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const SessionContext = createContext<{
  error: Error | undefined;
  data: any;
  status: AuthenticationStatus;
  role?: Roles,
  refresh: (redirect?: boolean) => void | Promise<void>;
  update: () => void | Promise<void>;
  logout: (redirect?: boolean) => void | Promise<void>;
}>({
  error: undefined,
  data: null,
  status: 'loading',
  refresh: () => {},
  update: () => {},
  logout: () => {},
})

export function SessionProvider({ children }: Readonly<{ children: React.ReactNode; }>) {

  const [data, setData] = useState<any>()
  const [status, setStatus] = useState<AuthenticationStatus>('loading')
  const [error, setError] = useState<Error | undefined>()

  const authenticated = useMemo(() => status === 'authenticated', [status])

  const role = useMemo(() => data?.user?.role || undefined, [data]);

  const refresh = useCallback((redirect: boolean) => {
    // if (authenticated) {
    //   const up = updateSession.bind(null, role)
    //   up().catch(console.log)
    // }
    const url = new URL('/api/auth/session', window.location.origin);
    fetch(url)
      .then((response) => response.json())
      .then(async ({ data: session }: { data: JWTPayload | { [key: string]: any;} | null;}) => {
        if (!session || moment(session!.expiresAt as Date|string).tz('Asia/Manila').isBefore(moment.tz('Asia/Manila'))) {
          const signOut = destroySession
          await signOut()
          setData(null)
          setStatus('unauthenticated')
          if (redirect) {
            window.location.href = window.location.origin;
          }
        } else {
          setData(session)
          setStatus('authenticated')
        }
      })
      .catch((error: any) => {
        setData(null)
        setError(error)
        setStatus('error')
        if (redirect) {
          window.location.replace(window.location.origin)
        }
      })
  }, []);

  const update = useCallback(() => {
    if (authenticated) {
      updateSession(role).catch(console.log)
    }
  }, [authenticated, role])

  const pathname = usePathname()

  useEffect(() => {
    refresh(false)
    // eslint-disable-next-line
  }, [pathname])

  const logout = useCallback(async (redirect: boolean = false) => {
    const signOut = destroySession.bind(null)
    await signOut()
    setData(null)
    setStatus('unauthenticated')
  }, []);

  return <SessionContext.Provider value={{
    logout,
    error,
    data,
    status,
    role,
    refresh: (redirect: boolean = true) => refresh(redirect),
    update
  }}>
    {children}
  </SessionContext.Provider>
}

export function useSession({ redirect = true } : Readonly<{ redirect?: boolean; }>) {
  const context = useContext(SessionContext)
  const { error, data, status, refresh, update, logout, role } = context
  const refreshSession = refresh.bind(null, redirect)
  const signOut = logout.bind(null, redirect);

  useEffect(() => {
    if (redirect) {
      refreshSession()
    }
    // eslint-disable-next-line
  }, [status])

  return {
    error,
    data,
    status,
    refresh: refreshSession,
    update,
    logout: signOut,
    role
  }
}