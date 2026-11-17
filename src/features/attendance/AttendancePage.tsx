import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, Save } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Badge, AttendanceBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { listAccessibleClasses, type ClassRow } from '@/features/classes/adminService'
import {
  listRoster, listAttendanceForDay, listAttendanceHistory, saveRoll, saveJustification,
  describeAttendanceError, STATUS_LABELS,
  type AttendanceStatus, type AttendanceRow, type RosterStudent,
} from '@/features/attendance/attendanceService'
import { formatDate } from '@/lib/utils'

const STATUS_BUTTONS: { status: AttendanceStatus; icon: ReactNode; color: string }[] = [
  { status: 'present', icon: <CheckCircle size={14} />, color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' },
  { status: 'absent', icon: <XCircle size={14} />, color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' },
  { status: 'retard', icon: <Clock size={14} />, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' },
  { status: 'excuse', icon: <AlertCircle size={14} />, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' },
]

function errorMessage(err: unknown): string {
  return describeAttendanceError(err)
}

export default function AttendancePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const role = user?.role
  const canRecord = role === 'admin' || role === 'enseignant'

  const today = new Date().toISOString().split('T')[0]
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(today)

  const [roster, setRoster] = useState<RosterStudent[]>([])
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [history, setHistory] = useState<AttendanceRow[]>([])

  const [justifyTarget, setJustifyTarget] = useState<AttendanceRow | null>(null)
  const [justifyText, setJustifyText] = useState('')

  // Initialisation : classes pour le personnel
  useEffect(() => {
    async function init() {
      try {
        if (canRecord) {
          const cls = await listAccessibleClasses(user?.id ?? '', role ?? '')
          setClasses(cls)
          if (cls.length > 0) setSelectedClass(cls[0].id)
        }
      } catch (err) {
        toast({ type: 'error', title: 'Chargement impossible', message: errorMessage(err) })
      } finally {
        setLoading(false)
      }
    }
    if (role) void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  // Appel de la classe pour la date choisie
  async function loadRoll() {
    if (!canRecord || !selectedClass) return
    try {
      const [students, existing] = await Promise.all([
        listRoster(selectedClass),
        listAttendanceForDay(selectedClass, date),
      ])
      setRoster(students)
      const byStudent = new Map(existing.map(r => [r.student_id, r.status]))
      const next: Record<string, AttendanceStatus> = {}
      for (const s of students) next[s.id] = byStudent.get(s.id) ?? 'present'
      setStatuses(next)
    } catch (err) {
      toast({ type: 'error', title: 'Chargement de l’appel impossible', message: errorMessage(err) })
    }
  }

  useEffect(() => {
    void loadRoll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, date, role])

  // Historique : par classe pour le personnel, par enfant pour le parent
  async function loadHistory() {
    if (!role) return
    try {
      setHistory(await listAttendanceHistory(canRecord ? selectedClass || null : null))
    } catch (err) {
      toast({ type: 'error', title: 'Historique impossible', message: errorMessage(err) })
    }
  }

  useEffect(() => {
    if (loading) return
    void loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selectedClass, role])

  const counts = useMemo(() => {
    const values = Object.values(statuses)
    return {
      present: values.filter(v => v === 'present').length,
      absent: values.filter(v => v === 'absent').length,
      retard: values.filter(v => v === 'retard').length,
    }
  }, [statuses])

  function setAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {}
    for (const s of roster) next[s.id] = status
    setStatuses(next)
  }

  async function handleSave() {
    if (!selectedClass || roster.length === 0) return
    setSaving(true)
    try {
      await saveRoll(
        selectedClass,
        date,
        roster.map(s => ({ student_id: s.id, status: statuses[s.id] ?? 'present' })),
      )
      toast({
        type: 'success',
        title: 'Appel enregistré',
        message: `${counts.present} présent(s), ${counts.absent} absent(s), ${counts.retard} en retard — ${formatDate(date)}`,
      })
      await Promise.all([loadRoll(), loadHistory()])
    } catch (err) {
      toast({ type: 'error', title: 'Enregistrement refusé', message: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  async function handleJustify() {
    if (!justifyTarget) return
    try {
      await saveJustification(justifyTarget.id, justifyText)
      toast({ type: 'success', title: 'Justificatif enregistré' })
      setJustifyTarget(null)
      await loadHistory()
    } catch (err) {
      toast({ type: 'error', title: 'Enregistrement refusé', message: errorMessage(err) })
    }
  }

  if (!role || loading) return <PageLoading message="Chargement des présences…" />

  const classOpts = classes.map(c => ({ value: c.id, label: c.name }))

  return (
    <PageWrapper
      title="Présences & Absences"
      subtitle={canRecord ? 'Appel quotidien et suivi des absences' : 'Présences et absences de vos enfants'}
      actions={canRecord ? (
        <div className="flex items-center gap-2">
          <Select options={classOpts} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-40" />
          <input
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-forest)] bg-white"
          />
          <Button icon={<Save size={16} />} onClick={handleSave} loading={saving} disabled={roster.length === 0}>
            Enregistrer l’appel
          </Button>
        </div>
      ) : undefined}
    >
      {canRecord && (
        <>
          {roster.length === 0 ? (
            <Card padding="lg" className="text-center mb-6">
              <p className="font-semibold text-[var(--color-text)]">Aucun élève actif dans cette classe</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Ajoutez des élèves à la classe depuis la page Élèves.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card padding="sm" className="text-center">
                  <p className="text-2xl font-bold text-green-600">{counts.present}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Présents</p>
                </Card>
                <Card padding="sm" className="text-center">
                  <p className="text-2xl font-bold text-red-500">{counts.absent}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Absents</p>
                </Card>
                <Card padding="sm" className="text-center">
                  <p className="text-2xl font-bold text-amber-500">{counts.retard}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Retards</p>
                </Card>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Tous :</span>
                {STATUS_BUTTONS.map(btn => (
                  <button
                    key={btn.status}
                    onClick={() => setAll(btn.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${btn.color}`}
                  >
                    {btn.icon}{STATUS_LABELS[btn.status]}
                  </button>
                ))}
              </div>

              <Card padding="none" className="mb-8">
                <div className="divide-y divide-[var(--color-border)]">
                  {roster.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-ivory)] transition-colors">
                      <span className="w-6 text-xs text-[var(--color-text-muted)] text-right flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--color-text)]">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{s.student_number}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {STATUS_BUTTONS.map(btn => (
                          <button
                            key={btn.status}
                            onClick={() => setStatuses(prev => ({ ...prev, [s.id]: btn.status }))}
                            title={STATUS_LABELS[btn.status]}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              statuses[s.id] === btn.status
                                ? btn.color + ' scale-105 shadow-sm'
                                : 'bg-[var(--color-ivory)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                            }`}
                          >
                            {btn.icon}
                            <span className="hidden sm:inline">{STATUS_LABELS[btn.status]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}

      <div>
        <h3 className="font-semibold text-[var(--color-text)] mb-3">
          {canRecord ? 'Historique de la classe' : 'Historique des présences'}
        </h3>
        <Card padding="none" className="overflow-x-auto">
          {history.length === 0 ? (
            <p className="p-6 text-sm text-center text-[var(--color-text-muted)]">Aucune présence enregistrée.</p>
          ) : (
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Justification</th>
                  {canRecord && <th className="text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {history.map(row => {
                  const name = row.students ? `${row.students.first_name} ${row.students.last_name}` : '—'
                  const isAbsence = row.status !== 'present'
                  return (
                    <tr key={row.id}>
                      <td>
                        <p className="text-sm font-medium">{name}</p>
                        {!canRecord && row.classes && <p className="text-xs text-[var(--color-text-muted)]">{row.classes.name}</p>}
                      </td>
                      <td className="text-sm">{formatDate(row.attendance_date)}</td>
                      <td><AttendanceBadge status={row.status} /></td>
                      <td className="text-sm text-[var(--color-text-muted)]">
                        {row.justification ?? (isAbsence ? <Badge variant="gray" size="sm">Non justifié</Badge> : '—')}
                      </td>
                      {canRecord && (
                        <td className="text-right">
                          {isAbsence && (
                            <Button size="sm" variant="ghost" onClick={() => { setJustifyTarget(row); setJustifyText(row.justification ?? '') }}>
                              Justifier
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Modal
        open={!!justifyTarget}
        onClose={() => setJustifyTarget(null)}
        title="Justifier l’absence"
        size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setJustifyTarget(null)}>Annuler</Button>
          <Button onClick={handleJustify}>Enregistrer</Button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            {justifyTarget?.students?.first_name} {justifyTarget?.students?.last_name} — {justifyTarget && formatDate(justifyTarget.attendance_date)}
          </p>
          <Input label="Motif" value={justifyText} onChange={e => setJustifyText(e.target.value)} placeholder="Maladie, rendez-vous médical…" />
        </div>
      </Modal>
    </PageWrapper>
  )
}
