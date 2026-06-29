import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface AuthUser {
  name: string
  email: string
  guest?: boolean
}

interface AuthValue {
  user: AuthUser | null
  signIn: (user: AuthUser) => void
  signOut: () => void
}

const Ctx = createContext<AuthValue | null>(null)
const KEY = 'inventar.auth.v1'

function load(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(load)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user))
      else localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [user])

  const signIn = useCallback((u: AuthUser) => setUser(u), [])
  const signOut = useCallback(() => setUser(null), [])

  const value = useMemo<AuthValue>(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
