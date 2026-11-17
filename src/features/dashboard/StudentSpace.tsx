import { useEffect, useState } from 'react'
import { BarChart3, Calendar, ClipboardCheck, FileText, GraduationCap } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { PageWrapper } from '@/components/layout/Layout'
import { Card, StatCard } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoading } from '@/components/ui/States'
import {
  getMyStudentRecord,
  type ChildRecord,
} from '@/features/students/studentService'

// Données réelles : identité, classe et numéro d'élève.
// Les notes, devoirs et emploi du temps seront branchés dans une étape suivante.
export default function StudentSpace() {
  const { user } = useAuth()
  const [record, setRecord] = useState<ChildRecord | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getMyStudentRecord(user.id)
      .then(setRecord)
      .catch(err => setError((err as { message?: string })?.message ?? 'Erreur inconnue'))
  }, [user])

  if (record === undefined && !error) {
    return <PageLoading message="Chargement de votre fiche…" />
  }

  const fullName = record ? `${record.first_name} ${record.last_name}` : ''

  return (
    <PageWrapper
      title="Mon espace élève"
      subtitle={record ? `Bienvenue, ${record.first_name} !` : 'Fiche non rattachée'}
    >
      {error && (
        <Card className="mb-6 text-sm text-red-600">
          Impossible de charger votre fiche : {error}
        </Card>
      )}

      {record === null && (
        <Card padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-sage-light)] flex items-center justify-center text-[var(--color-forest)]">
              <GraduationCap size={24} />
            </div>
            <h2 className="font-semibold text-[var(--color-text)]">Fiche non rattachée</h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
              Votre compte n’est pas encore lié à votre fiche d’élève. Demandez au secrétariat de le faire.
            </p>
          </div>
        </Card>
      )}

      {record && (
        <div className="space-y-6">
          <Card className="!bg-[var(--color-forest)] border-0">
            <div className="flex items-center gap-4">
              <Avatar name={fullName} size="xl" className="ring-4 ring-white/20" />
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Mon profil</p>
                <h2 className="text-white font-bold text-xl font-serif">{fullName}</h2>
                <p className="text-white/70 text-sm">
                  {record.classes?.name ?? 'Classe non renseignée'} • {record.student_number}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Moyenne générale" value="—" subtitle="Notes non encore connectées" icon={<BarChart3 size={18} />} color="forest" />
            <StatCard title="Cours aujourd’hui" value="—" subtitle="Emploi du temps non encore connecté" icon={<Calendar size={18} />} color="sage" />
            <StatCard title="Devoirs à rendre" value="—" subtitle="Devoirs non encore connectés" icon={<FileText size={18} />} color="yellow" />
            <StatCard title="Absences" value="—" subtitle="Appel non encore connecté" icon={<ClipboardCheck size={18} />} color="coral" />
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
