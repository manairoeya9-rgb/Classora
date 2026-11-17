import { useState } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card, CardHeader } from '@/components/ui/Card'
import { AttendanceBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { DEMO_STUDENTS, DEMO_CLASSES, DEMO_ATTENDANCE } from '@/lib/demo-data'
import type { Attendance } from '@/types'

const CLASS_OPTS = DEMO_CLASSES.map(c => ({ value: c.id, label: c.name }))

type Status = 'present' | 'absent' | 'retard' | 'excuse'

const STATUS_BUTTONS: { status: Status; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'present', label: 'Présent', icon: <CheckCircle size={14} />, color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' },
  { status: 'absent',  label: 'Absent',  icon: <XCircle size={14} />,    color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' },
  { status: 'retard',  label: 'Retard',  icon: <Clock size={14} />,      color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' },
  { status: 'excuse',  label: 'Excusé',  icon: <AlertCircle size={14} />,color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' },
]

export default function AttendancePage() {
  const { toast } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const [selectedClass, setSelectedClass] = useState('class-cp')
  const [selectedDate, setSelectedDate] = useState(today)
  const [saving, setSaving] = useState(false)

  const classStudents = DEMO_STUDENTS.filter(s => s.classe_id === selectedClass)

  // Build attendance state from demo + allow editing
  const [attendance, setAttendance] = useState<Record<string, Status>>(() => {
    const rec: Record<string, Status> = {}
    classStudents.forEach(s => {
      const existing = DEMO_ATTENDANCE.find(a => a.student_id === s.id)
      rec[s.id] = (existing?.status as Status) ?? 'present'
    })
    return rec
  })

  function setStatus(studentId: string, status: Status) {
    setAttendance(a => ({ ...a, [studentId]: status }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    const presentCount = Object.values(attendance).filter(s => s === 'present').length
    const absentCount  = Object.values(attendance).filter(s => s === 'absent').length
    toast({ type: 'success', title: 'Appel enregistré', message: `${presentCount} présents, ${absentCount} absent(s) — ${formatDate(selectedDate)}` })
    setSaving(false)
  }

  function markAll(status: Status) {
    const updated: Record<string, Status> = {}
    classStudents.forEach(s => { updated[s.id] = status })
    setAttendance(updated)
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount  = Object.values(attendance).filter(s => s === 'absent').length
  const retardCount  = Object.values(attendance).filter(s => s === 'retard').length

  return (
    <PageWrapper
      title="Présences & Absences"
      subtitle="Appel quotidien et suivi des absences"
      actions={
        <div className="flex items-center gap-2">
          <Select options={CLASS_OPTS} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-36" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-forest)] bg-white" />
          <Button icon={<Save size={16} />} onClick={handleSave} loading={saving}>Enregistrer l'appel</Button>
        </div>
      }
    >
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Présents</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-red-500">{absentCount}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Absents</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-amber-500">{retardCount}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Retards</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-[var(--color-text-muted)] font-medium">Tous :</span>
        {STATUS_BUTTONS.map(btn => (
          <button key={btn.status} onClick={() => markAll(btn.status)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${btn.color}`}>
            {btn.icon}{btn.label}
          </button>
        ))}
      </div>

      {/* Roll Call */}
      <Card padding="none">
        <div className="divide-y divide-[var(--color-border)]">
          {classStudents.map((student, idx) => (
            <div key={student.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-ivory)] transition-colors">
              <span className="w-6 text-xs text-[var(--color-text-muted)] text-right flex-shrink-0">{idx + 1}</span>
              <Avatar name={student.full_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[var(--color-text)]">{student.full_name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{student.student_number}</p>
              </div>
              <div className="flex items-center gap-1">
                {STATUS_BUTTONS.map(btn => (
                  <button
                    key={btn.status}
                    onClick={() => setStatus(student.id, btn.status)}
                    title={btn.label}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      attendance[student.id] === btn.status
                        ? btn.color + ' scale-105 shadow-sm'
                        : 'bg-[var(--color-ivory)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:' + btn.color
                    }`}
                  >
                    {btn.icon}
                    <span className="hidden sm:inline">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Past Absences */}
      <div className="mt-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-3">Historique des absences récentes</h3>
        <Card padding="none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Justification</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ATTENDANCE.filter(a => a.status !== 'present').map(att => {
                const student = DEMO_STUDENTS.find(s => s.id === att.student_id)
                return (
                  <tr key={att.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={student?.full_name ?? ''} size="xs" />
                        <span className="text-sm font-medium">{student?.full_name}</span>
                      </div>
                    </td>
                    <td className="text-sm">{formatDate(att.date)}</td>
                    <td><AttendanceBadge status={att.status} /></td>
                    <td className="text-sm text-[var(--color-text-muted)]">{att.justification ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </PageWrapper>
  )
}
