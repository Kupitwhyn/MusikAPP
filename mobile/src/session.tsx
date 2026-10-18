import { AppState, type AppStateStatus } from "react-native"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
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

  const signOut = useCallback(async () => {
    await apiSignOut()
    setSession(null)
  }, [])

  useEffect(() => {
    let active = true
    void Promise.resolve()
      .then(refreshSession)
      .then(
        () => {
          if (active) setLoading(false)
        },
        (cause: unknown) => {
          if (!active) return
          console.error("Unable to restore the mobile session", cause)
          setLoading(false)
        },
      )
    return () => {
      active = false
    }
  }, [refreshSession])

  useEffect(() => {
    function onStateChange(status: AppStateStatus) {
      if (status === "active") void refreshSession()
    }
    const subscription = AppState.addEventListener("change", onStateChange)
    return () => subscription.remove()
  }, [refreshSession])

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshSession()
    }, 15000)
    return () => clearInterval(interval)
  }, [refreshSession])

  const value = useMemo(() => ({ session, loading, refreshSession, signOut }), [session, loading, refreshSession, signOut])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error("useSession must be used within SessionProvider")
  return value
}
