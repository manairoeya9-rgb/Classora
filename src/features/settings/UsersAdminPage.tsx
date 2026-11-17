import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import supabase from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { UserRole } from '@/types'

// Le schéma profiles n'est pas encore décrit dans database.ts : on passe par `any`.
const db = supabase as any

interface UserRow {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  created_at: string
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Direction' },
  { value: 'secretariat', label: 'Secrétariat' },
  { value: 'enseignant', label: 'Enseignant' },
  { value: 'parent', label: 'Parent' },
  { value: 'eleve', label: 'Élève' },
]

const ROLE_BADGE: Record<UserRole, { variant: 'purple' | 'sage' | 'coral' | 'blue' | 'yellow'; label: string }> = {
  admin: { variant: 'purple', label: 'Direction' },
  secretariat: { variant: 'yellow', label: 'Secrétariat' },
  enseignant: { variant: 'sage', label: 'Enseignant' },
  parent: { variant: 'coral', label: 'Parent' },
  eleve: { variant: 'blue', label: 'Élève' },
}

function errorMessage(err: unknown): string {
  return (err as { message?: string })?.message ?? 'Erreur inconnue'
}

export default function UsersAdminPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<Record<string, UserRole>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const { data, error } = await db
        .from('profiles')
        .select('id, full_name, email, phone, role, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data ?? [])
      setPending({})
    } catch (err) {
      toast({ type: 'error', title: 'Chargement impossible', message: errorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveRole(row: UserRow) {
    const newRole = pending[row.id]
    if (!newRole || newRole === row.role) return

    setSavingId(row.id)
    try {
      const { error } = await db.rpc('set_user_role', {
        target_id: row.id,
        new_role: newRole,
      })
      if (error) throw error
      toast({
        type: 'success',
        title: 'Rôle mis à jour',
        message: `${row.full_name || row.email} est maintenant : ${ROLE_BADGE[newRole].label}.`,
      })
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Modification impossible', message: errorMessage(err) })
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <PageLoading message="Chargement des utilisateurs…" />
  }

  return (
    <PageWrapper
      title="Gestion des utilisateurs"
      subtitle={`${users.length} compte${users.length > 1 ? 's' : ''} • Seule la direction peut modifier les rôles`}
    >
      <Card padding="none" className="overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Téléphone</th>
              <th>Inscrit le</th>
              <th>Rôle</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(row => {
              const isSelf = user?.id === row.id
              const selected = pending[row.id] ?? row.role
              const changed = selected !== row.role

              return (
                <tr key={row.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={row.full_name || row.email} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {row.full_name || '—'}
                          {isSelf && <span className="text-xs text-[var(--color-text-muted)]"> (vous)</span>}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{row.phone ?? '—'}</td>
                  <td className="text-sm">{formatDate(row.created_at)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Badge variant={ROLE_BADGE[row.role].variant} size="sm">
                        {ROLE_BADGE[row.role].label}
                      </Badge>
                      <Select
                        value={selected}
                        onChange={e => setPending(p => ({ ...p, [row.id]: e.target.value as UserRole }))}
                        options={ROLE_OPTIONS}
                        disabled={isSelf}
                        className="w-40"
                      />
                    </div>
                  </td>
                  <td className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isSelf || !changed}
                      loading={savingId === row.id}
                      onClick={() => saveRole(row)}
                    >
                      Enregistrer
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </PageWrapper>
  )
}
