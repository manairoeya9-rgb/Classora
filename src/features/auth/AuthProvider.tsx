
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import type { Profile, UserRole } from '@/types'
import supabase from '@/lib/supabase'

interface AuthContextValue {
  user: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (
    fullName: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>
  logout: () => void
  isRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function digitsCount(value: string): number {
  return value.replace(/\D/g, '').length
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Restaurer uniquement une session authentifiée par Supabase.
  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        const session = data.session

        if (!session?.user) {
          if (mounted) setUser(null)
          return
        }

        const { data: profile, error: profileError } = await (
          supabase as any
        )
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile) {
          await supabase.auth.signOut()
          if (mounted) setUser(null)
          return
        }

        if (mounted) {
          setUser(profile as Profile)
        }
      } catch (error) {
        console.error('Erreur de restauration de session :', error)

        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void restoreSession()

    return () => {
      mounted = false
    }
  }, [])

  // Connexion exclusivement via Supabase.
  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

        if (error) {
          if (error.message.toLowerCase().includes('not confirmed')) {
            return {
              error:
                'Votre adresse e-mail n’est pas encore confirmée. Ouvrez le lien reçu par e-mail.',
            }
          }

          return { error: 'Email ou mot de passe incorrect.' }
        }

        if (!data.user) {
          return { error: 'Impossible de récupérer votre compte.' }
        }

        const { data: profile, error: profileError } = await (
          supabase as any
        )
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          await supabase.auth.signOut()
          setUser(null)

          return {
            error: 'Profil introuvable. Veuillez contacter l’administrateur.',
          }
        }

        setUser(profile as Profile)

        return {}
      } catch {
        return {
          error: 'Connexion impossible. Vérifiez votre connexion Internet.',
        }
      }
    },
    []
  )

  // Inscription d'un nouveau compte.
  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      phone: string
    ): Promise<{ error?: string; needsEmailConfirmation?: boolean }> => {
      const name = fullName.trim()
      const phoneNumber = phone.trim()

      if (digitsCount(phoneNumber) < 8) {
        return {
          error: 'Le numéro de téléphone doit contenir au moins 8 chiffres.',
        }
      }
      const normalizedEmail = email.trim().toLowerCase()

      if (!name || !normalizedEmail || !password) {
        return { error: 'Veuillez remplir tous les champs.' }
      }

      if (password.length < 8) {
        return {
          error: 'Le mot de passe doit contenir au moins 8 caractères.',
        }
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: name,
              phone: phoneNumber,
            },
          },
        })

        if (error) return { error: error.message }

        if (!data.user) {
          return { error: 'La création du compte a échoué.' }
        }

        // Supabase peut demander une confirmation par email.
        if (!data.session) {
          return { needsEmailConfirmation: true }
        }

        const { data: profile, error: profileError } = await (
          supabase as any
        )
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          await supabase.auth.signOut()
          setUser(null)

          return {
            error:
              'Compte créé, mais le profil n’a pas pu être chargé. Vérifiez le trigger SQL dans Supabase.',
          }
        }

        setUser(profile as Profile)

        return {}
      } catch {
        return {
          error: 'Inscription impossible. Réessayez dans quelques instants.',
        }
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    void supabase.auth.signOut()
  }, [])

  const isRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
