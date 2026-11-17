import { useEffect, useState } from 'react'
import { BarChart3, ClipboardCheck, DollarSign, FileText, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { PageWrapper } from '@/components/layout/Layout'
import { Card, StatCard } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoading } from '@/components/ui/States'
import {
  getMyChildren,
  type ChildRecord,
  type LinkedChild,
} from '@/features/students/studentService'

// Données réelles : identité et classe de l'enfant.
// Notes, présences, frais et devoirs ne sont pas encore reliés à la base :
// ils sont affichés comme « à venir » plutôt qu'avec de fausses valeurs.
function ChildCard({ child }: { child: ChildRecord }) {
  const fullName = `${child.first_name} ${child.last_name}`

  return (
    <div className="space-y-4">
      <Card className="!bg-[var(--color-forest)] border-0">
        <div className="flex items-center gap-4">
          <Avatar name={fullName} size="xl" className="ring-4 ring-white/20" />
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Mon enfant</p>
            <h2 className="text-white font-bold text-xl font-serif">{fullName}</h2>
            <p className="text-white/70 text-sm">
              {child.classes?.name ?? 'Classe non renseignée'} • {child.student_number}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Moyenne générale" value="—" subtitle="Notes non encore connectées" icon={<BarChart3 size={18} />} color="sage" />
        <StatCard title="Présences" value="—" subtitle="Appel non encore connecté" icon={<ClipboardCheck size={18} />} color="yellow" />
        <StatCard title="Devoirs" value="—" subtitle="Devoirs non encore connectés" icon={<FileText size={18} />} color="lavender" />
        <StatCard title="Solde dû" value="—" subtitle="Frais non encore connectés" icon={<DollarSign size={18} />} color="coral" />
      </div>
    </div>
  )
}

export default function ParentSpace() {
  const { user } = useAuth()
  const [children, setChildren] = useState<LinkedChild[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getMyChildren(user.id)
      .then(setChildren)
      .catch(err => setError((err as { message?: string })?.message ?? 'Erreur inconnue'))
  }, [user])

  if (!children && !error) {
    return <PageLoading message="Chargement de vos enfants…" />
  }

  const count = children?.length ?? 0

  return (
    <PageWrapper
      title="Espace parent"
      subtitle={count > 0 ? `${count} enfant${count > 1 ? 's' : ''} rattaché${count > 1 ? 's' : ''} à votre compte` : 'Aucun enfant rattaché'}
    >
      {error && (
        <Card className="mb-6 text-sm text-red-600">
          Impossible de charger vos données : {error}
        </Card>
      )}

      {children && children.length === 0 && (
        <Card padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-sage-light)] flex items-center justify-center text-[var(--color-forest)]">
              <Users size={24} />
            </div>
            <h2 className="font-semibold text-[var(--color-text)]">Aucun enfant rattaché</h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
              Votre compte n’est encore lié à aucun élève. Adressez-vous au secrétariat de l’école.
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-8">
        {children?.map(({ student }) => (
          <ChildCard key={student.id} child={student} />
        ))}
      </div>
    </PageWrapper>
  )
}
