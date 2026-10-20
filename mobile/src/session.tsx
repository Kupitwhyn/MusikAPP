import { AppState, type AppStateStatus } from "react-native"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { getSession, signOut as apiSignOut, type MobileSession } from "./api"

type SessionContextValue = {
  session: MobileSession | null
  loading: boolean
  refreshSession: () => Promise<MobileSession | null>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MobileSession | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshErrorLogged = useRef(false)

  const refreshSession = useCallback(async () => {
    const nextSession = await getSession()
    if (!nextSession) {
      setSession(null)
      return null
    }

    if (nextSession.user.role !== "AUDIENCE") {
      await apiSignOut()
      setSession(null)
      return null
    }

    setSession(nextSession)
    return nextSession
  }, [])

  const refreshSessionInBackground = useCallback(async () => {
    try {
      const nextSession = await refreshSession()
      refreshErrorLogged.current = false
      return nextSession
    } catch (cause) {
      if (!refreshErrorLogged.current) {
        console.error("Unable to refresh the mobile session. Check the API connection.", cause)
        refreshErrorLogged.current = true
      }
      return null
    }
  }, [refreshSession])

  const signOut = useCallback(async () => {
    await apiSignOut()
    setSession(null)
  }, [])

  useEffect(() => {
    let active = true
    void refreshSessionInBackground().finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [refreshSessionInBackground])

  useEffect(() => {
    function onStateChange(status: AppStateStatus) {
      if (status === "active") void refreshSessionInBackground()
    }
    const subscription = AppState.addEventListener("change", onStateChange)
    return () => subscription.remove()
  }, [refreshSessionInBackground])

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshSessionInBackground()
    }, 15000)
    return () => clearInterval(interval)
  }, [refreshSessionInBackground])

  const value = useMemo(() => ({ session, loading, refreshSession, signOut }), [session, loading, refreshSession, signOut])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error("useSession must be used within SessionProvider")
  return value
}
