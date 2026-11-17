import { useState, useMemo } from 'react'
import { Plus, Download, BarChart3, ChevronDown } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { cn, formatDate, formatGrade, gradeColor, gradeLabel } from '@/lib/utils'
import { DEMO_STUDENTS, DEMO_SUBJECTS, DEMO_CLASSES, DEMO_GRADES } from '@/lib/demo-data'
import type { Grade } from '@/types'

const CLASS_OPTS = DEMO_CLASSES.map(c => ({ value: c.id, label: c.name }))
const SUBJECT_OPTS = DEMO_SUBJECTS.map(s => ({ value: s.id, label: s.name }))
const TRIMESTER_OPTS = [
  { value: '1', label: '1er Trimestre' },
  { value: '2', label: '2e Trimestre' },
  { value: '3', label: '3e Trimestre' },
]
const STUDENT_OPTS = DEMO_STUDENTS.map(s => ({ value: s.id, label: s.full_name }))

export default function GradesPage() {
  const { toast } = useToast()
  const [grades, setGrades] = useState<Grade[]>(DEMO_GRADES as Grade[])
  const [selectedClass, setSelectedClass] = useState('class-cp')
  const [selectedTrimester, setSelectedTrimester] = useState('1')
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ student_id: '', subject_id: '', label: '', value: '', max_value: '20', date: new Date().toISOString().split('T')[0], comment: '' })

  // Students in selected class
  const classStudents = useMemo(() =>
    DEMO_STUDENTS.filter(s => s.classe_id === selectedClass), [selectedClass])

  // Grades for selected class + trimester
  const classGrades = useMemo(() =>
    grades.filter(g => g.classe_id === selectedClass && g.trimester === +selectedTrimester),
    [grades, selectedClass, selectedTrimester])

  // Compute average per student
  function getStudentAverage(studentId: string): number | null {
    const sg = classGrades.filter(g => g.student_id === studentId)
    if (!sg.length) return null
    const weighted = sg.reduce((acc, g) => {
      const sub = DEMO_SUBJECTS.find(s => s.id === g.subject_id)
      return acc + (g.value / g.max_value * 20) * (sub?.coefficient ?? 1)
    }, 0)
    const totalCoef = sg.reduce((acc, g) => {
      const sub = DEMO_SUBJECTS.find(s => s.id === g.subject_id)
      return acc + (sub?.coefficient ?? 1)
    }, 0)
    return weighted / totalCoef
  }

  // Get grade for student+subject
  function getGrade(studentId: string, subjectId: string) {
    return classGrades.find(g => g.student_id === studentId && g.subject_id === subjectId)
  }

  async function handleSaveGrade() {
    if (!form.student_id || !form.subject_id || !form.value || !form.label) {
      toast({ type: 'error', title: 'Champs manquants' }); return
    }
    const val = parseFloat(form.value)
    const max = parseFloat(form.max_value)
    if (isNaN(val) || val < 0 || val > max) {
      toast({ type: 'error', title: 'Note invalide', message: `La note doit être entre 0 et ${max}.` }); return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    const newGrade: Grade = {
      id: `g-${Date.now()}`,
      student_id: form.student_id,
      subject_id: form.subject_id,
      classe_id: selectedClass,
      academic_year_id: 'ay-2025-2026',
      trimester: +selectedTrimester as 1|2|3,
      value: val,
      max_value: max,
      label: form.label,
      date: form.date,
      comment: form.comment || undefined,
      subject: DEMO_SUBJECTS.find(s => s.id === form.subject_id),
    }
    setGrades(gs => [...gs, newGrade])
    toast({ type: 'success', title: 'Note enregistrée', message: `Note de ${val}/${max} ajoutée.` })
    setAddOpen(false)
    setSaving(false)
  }

  function generateReport() {
    toast({ type: 'info', title: 'Génération du bulletin', message: 'Le bulletin PDF sera téléchargé dans un instant…' })
    setTimeout(() => {
      // Simple PDF simulation with jsPDF
      import('jspdf').then(({ jsPDF }) => {
        const doc = new jsPDF()
        const cls = DEMO_CLASSES.find(c => c.id === selectedClass)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.text('CLASSORA — École Primaire', 105, 20, { align: 'center' })
        doc.setFontSize(12)
        doc.text(`Bulletin de notes — ${cls?.name} — Trimestre ${selectedTrimester}`, 105, 30, { align: 'center' })
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        let y = 50
        classStudents.forEach(student => {
          const avg = getStudentAverage(student.id)
          doc.setFont('helvetica', 'bold')
          doc.text(`${student.full_name} — Moyenne : ${avg ? avg.toFixed(2) : 'N/A'}/20`, 20, y)
          doc.setFont('helvetica', 'normal')
          y += 8
          DEMO_SUBJECTS.forEach(sub => {
            const g = getGrade(student.id, sub.id)
            if (g) {
              doc.text(`  ${sub.name}: ${g.value}/${g.max_value}`, 20, y)
              y += 6
            }
          })
          y += 5
          if (y > 270) { doc.addPage(); y = 20 }
        })
        doc.save(`bulletins-${cls?.name}-T${selectedTrimester}.pdf`)
        toast({ type: 'success', title: 'Bulletins téléchargés !' })
      })
    }, 500)
  }

  return (
    <PageWrapper
      title="Notes & Bulletins"
      subtitle="Saisie des notes et calcul automatique des moyennes"
      actions={
        <div className="flex items-center gap-2">
          <Select options={CLASS_OPTS} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-32" />
          <Select options={TRIMESTER_OPTS} value={selectedTrimester} onChange={e => setSelectedTrimester(e.target.value)} className="w-44" />
          <Button variant="secondary" icon={<Download size={16} />} onClick={generateReport}>Bulletins PDF</Button>
          <Button icon={<Plus size={16} />} onClick={() => { setForm({ student_id:'', subject_id:'', label:'', value:'', max_value:'20', date: new Date().toISOString().split('T')[0], comment:'' }); setAddOpen(true) }}>Ajouter une note</Button>
        </div>
      }
    >
      {/* Grade Grid */}
      <Card padding="none" className="overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[var(--color-ivory-dark)] z-10">Élève</th>
              {DEMO_SUBJECTS.map(sub => (
                <th key={sub.id} className="text-center whitespace-nowrap">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: sub.color }} />
                    <span className="text-[10px]">{sub.code}</span>
                    <span className="text-[9px] opacity-60">×{sub.coefficient}</span>
                  </div>
                </th>
              ))}
              <th className="text-center bg-[var(--color-forest)] text-white">Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map(student => {
              const avg = getStudentAverage(student.id)
              return (
                <tr key={student.id}>
                  <td className="sticky left-0 bg-white z-10 font-medium whitespace-nowrap">{student.full_name}</td>
                  {DEMO_SUBJECTS.map(sub => {
                    const g = getGrade(student.id, sub.id)
                    return (
                      <td key={sub.id} className="text-center">
                        {g ? (
                          <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', gradeColor(g.value / g.max_value * 20))}>
                            {g.value}/{g.max_value}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)] text-xs">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="text-center">
                    {avg !== null ? (
                      <span className={cn('text-sm font-bold px-2 py-1 rounded-full', gradeColor(avg))}>
                        {avg.toFixed(2)}
                      </span>
                    ) : <span className="text-[var(--color-text-muted)] text-xs">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {classStudents.slice(0, 4).map(student => {
          const avg = getStudentAverage(student.id)
          return (
            <Card key={student.id} padding="sm">
              <p className="font-semibold text-sm text-[var(--color-text)] truncate">{student.full_name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">{student.classe?.name}</p>
              {avg !== null ? (
                <>
                  <p className={cn('text-2xl font-bold', gradeColor(avg).split(' ')[1])}>{avg.toFixed(2)}<span className="text-sm font-normal text-[var(--color-text-muted)]">/20</span></p>
                  <Badge variant={avg >= 14 ? 'green' : avg >= 10 ? 'yellow' : 'red'} size="sm" className="mt-1">{gradeLabel(avg)}</Badge>
                </>
              ) : <p className="text-sm text-[var(--color-text-muted)]">Aucune note</p>}
            </Card>
          )
        })}
      </div>

      {/* Add Grade Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ajouter une note" size="md"
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>Annuler</Button><Button onClick={handleSaveGrade} loading={saving}>Enregistrer</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Élève" options={STUDENT_OPTS} value={form.student_id} onChange={e => setForm(f => ({...f, student_id: e.target.value}))} placeholder="Choisir un élève" required className="sm:col-span-2" />
          <Select label="Matière" options={SUBJECT_OPTS} value={form.subject_id} onChange={e => setForm(f => ({...f, subject_id: e.target.value}))} placeholder="Choisir une matière" required />
          <Input label="Libellé de l'évaluation" value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))} placeholder="Contrôle 1" required />
          <Input label="Note obtenue" type="number" min="0" step="0.5" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} placeholder="15" required />
          <Input label="Note maximale" type="number" min="1" value={form.max_value} onChange={e => setForm(f => ({...f, max_value: e.target.value}))} placeholder="20" />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
          <div className="sm:col-span-2">
            <Input label="Commentaire (optionnel)" value={form.comment} onChange={e => setForm(f => ({...f, comment: e.target.value}))} placeholder="Bon travail, mais des progrès à faire en…" />
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
