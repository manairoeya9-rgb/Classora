import { useEffect, useMemo, useState } from 'react'
import { Plus, Download } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { listClasses, type ClassRow } from '@/features/students/studentService'
import {
  listSubjects,
  listClassStudents,
  listGrades,
  getCurrentAcademicYearId,
  addGrade,
  computeAverage,
  type SubjectRow,
  type ClassStudent,
  type GradeRow,
  type Trimester,
} from '@/features/grades/gradeService'
import { cn, gradeColor, gradeLabel } from '@/lib/utils'

const TRIMESTER_OPTS = [
  { value: '1', label: '1er trimestre' },
  { value: '2', label: '2e trimestre' },
  { value: '3', label: '3e trimestre' },
]

interface Row {
  id: string
  name: string
  number: string
}

function errorMessage(err: unknown): string {
  return (err as { message?: string })?.message ?? 'Erreur inconnue'
}

export default function GradesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const role = user?.role

  const isStaff = role === 'admin' || role === 'enseignant' || role === 'secretariat'
  const canWrite = role === 'admin' || role === 'enseignant'

  const [classes, setClasses] = useState<ClassRow[]>([])
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [trimester, setTrimester] = useState<Trimester>(1)
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([])
  const [grades, setGrades] = useState<GradeRow[]>([])
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    student_id: '',
    subject_id: '',
    label: '',
    value: '',
    max_value: '20',
    grade_date: new Date().toISOString().split('T')[0],
    comment: '',
  })

  // Chargement initial : matières, et classes pour le personnel
  useEffect(() => {
    async function init() {
      try {
        const subs = await listSubjects()
        setSubjects(subs)
        if (isStaff) {
          const cls = await listClasses()
          setClasses(cls)
          if (cls.length > 0) setSelectedClass(cls[0].id)
        }
      } catch (err) {
        toast({ type: 'error', title: 'Chargement impossible', message: errorMessage(err) })
      } finally {
        setLoading(false)
      }
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  // Chargement des notes selon la vue
  async function loadData() {
    try {
      if (isStaff) {
        if (!selectedClass) {
          setClassStudents([])
          setGrades([])
          return
        }
        const [students, gs] = await Promise.all([
          listClassStudents(selectedClass),
          listGrades(selectedClass, trimester),
        ])
        setClassStudents(students)
        setGrades(gs)
      } else {
        // Parent et élève : la base ne renvoie que ce qui leur est permis
        setGrades(await listGrades(null, trimester))
      }
    } catch (err) {
      toast({ type: 'error', title: 'Chargement des notes impossible', message: errorMessage(err) })
    }
  }

  useEffect(() => {
    if (!role) return
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, selectedClass, trimester])

  // Lignes du tableau : élèves de la classe (personnel) ou enfants visibles (parent / élève)
  const rows: Row[] = useMemo(() => {
    if (isStaff) {
      return classStudents.map(s => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        number: s.student_number,
      }))
    }
    const seen = new Map<string, Row>()
    for (const g of grades) {
      if (!g.students || seen.has(g.student_id)) continue
      seen.set(g.student_id, {
        id: g.student_id,
        name: `${g.students.first_name} ${g.students.last_name}`,
        number: g.students.student_number,
      })
    }
    return Array.from(seen.values())
  }, [isStaff, classStudents, grades])

  function gradesOf(studentId: string): GradeRow[] {
    return grades.filter(g => g.student_id === studentId)
  }

  function averageOf(studentId: string): number | null {
    return computeAverage(
      gradesOf(studentId).map(g => ({
        subject_id: g.subject_id,
        value: Number(g.value),
        max_value: Number(g.max_value),
        coefficient: g.subjects?.coefficient ?? 1,
      }))
    )
  }

  function openAdd() {
    setForm({
      student_id: '',
      subject_id: '',
      label: '',
      value: '',
      max_value: '20',
      grade_date: new Date().toISOString().split('T')[0],
      comment: '',
    })
    setAddOpen(true)
  }

  async function handleSaveGrade() {
    const value = parseFloat(form.value)
    const max = parseFloat(form.max_value)

    if (!form.student_id || !form.subject_id || !form.label.trim() || !form.value) {
      toast({ type: 'error', title: 'Champs manquants', message: 'Élève, matière, libellé et note sont requis.' })
      return
    }
    if (isNaN(value) || isNaN(max) || max <= 0 || value < 0 || value > max) {
      toast({ type: 'error', title: 'Note invalide', message: `La note doit être comprise entre 0 et ${max || 20}.` })
      return
    }

    setSaving(true)
    try {
      const academicYearId = await getCurrentAcademicYearId()
      await addGrade({
        student_id: form.student_id,
        subject_id: form.subject_id,
        classe_id: selectedClass,
        academic_year_id: academicYearId,
        trimester,
        value,
        max_value: max,
        label: form.label.trim(),
        grade_date: form.grade_date,
        comment: form.comment.trim() || null,
      })
      toast({ type: 'success', title: 'Note enregistrée', message: `${value}/${max} ajoutée.` })
      setAddOpen(false)
      await loadData()
    } catch (err) {
      // La base refuse ce que le rôle n'a pas le droit de faire (ex. matière non enseignée)
      toast({ type: 'error', title: 'Enregistrement refusé', message: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  async function generateReport() {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const className = classes.find(c => c.id === selectedClass)?.name ?? ''

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('CLASSORA — École Primaire', 105, 20, { align: 'center' })
      doc.setFontSize(12)
      doc.text(`Bulletin de notes — ${className} — Trimestre ${trimester}`, 105, 30, { align: 'center' })

      let y = 45
      for (const row of rows) {
        const avg = averageOf(row.id)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(`${row.name} (${row.number}) — Moyenne : ${avg !== null ? avg.toFixed(2) : 'N/A'}/20`, 20, y)
        y += 7
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        for (const sub of subjects) {
          const sg = gradesOf(row.id).filter(g => g.subject_id === sub.id)
          if (sg.length === 0) continue
          const text = sg.map(g => `${Number(g.value)}/${Number(g.max_value)}`).join(' · ')
          doc.text(`  ${sub.name} (×${sub.coefficient}) : ${text}`, 22, y)
          y += 6
          if (y > 275) { doc.addPage(); y = 20 }
        }
        y += 5
        if (y > 275) { doc.addPage(); y = 20 }
      }

      doc.save(`bulletins-${className}-T${trimester}.pdf`)
      toast({ type: 'success', title: 'Bulletins téléchargés' })
    } catch (err) {
      toast({ type: 'error', title: 'Génération impossible', message: errorMessage(err) })
    }
  }

  if (!role || loading) {
    return <PageLoading message="Chargement des notes…" />
  }

  const classOpts = classes.map(c => ({ value: c.id, label: c.name }))
  const studentOpts = classStudents.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))
  const subjectOpts = subjects.map(s => ({ value: s.id, label: s.name }))

  return (
    <PageWrapper
      title="Notes & Bulletins"
      subtitle={
        isStaff
          ? canWrite
            ? 'Saisie des notes de vos matières et calcul des moyennes pondérées'
            : 'Consultation des notes et bulletins'
          : 'Notes de vos enfants'
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {isStaff && (
            <Select options={classOpts} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-40" />
          )}
          <Select options={TRIMESTER_OPTS} value={String(trimester)} onChange={e => setTrimester(Number(e.target.value) as Trimester)} className="w-44" />
          {isStaff && rows.length > 0 && (
            <Button variant="secondary" icon={<Download size={16} />} onClick={generateReport}>Bulletins PDF</Button>
          )}
          {canWrite && selectedClass && (
            <Button icon={<Plus size={16} />} onClick={openAdd}>Ajouter une note</Button>
          )}
        </div>
      }
    >
      {rows.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="font-semibold text-[var(--color-text)]">Aucune note à afficher</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {isStaff
              ? 'Cette classe n’a pas encore d’élèves actifs, ou aucune note n’a été saisie pour ce trimestre.'
              : 'Aucune note n’a encore été saisie pour vos enfants à ce trimestre.'}
          </p>
        </Card>
      ) : (
        <>
          <Card padding="none" className="overflow-x-auto">
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-[var(--color-ivory-dark)] z-10">Élève</th>
                  {subjects.map(sub => (
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
                {rows.map(row => {
                  const avg = averageOf(row.id)
                  return (
                    <tr key={row.id}>
                      <td className="sticky left-0 bg-white z-10 font-medium whitespace-nowrap">{row.name}</td>
                      {subjects.map(sub => {
                        const sg = gradesOf(row.id).filter(g => g.subject_id === sub.id)
                        return (
                          <td key={sub.id} className="text-center">
                            {sg.length > 0 ? (
                              <div className="flex flex-wrap justify-center gap-1">
                                {sg.map(g => (
                                  <span
                                    key={g.id}
                                    title={`${g.label} — ${g.grade_date}`}
                                    className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', gradeColor((Number(g.value) / Number(g.max_value)) * 20))}
                                  >
                                    {Number(g.value)}/{Number(g.max_value)}
                                  </span>
                                ))}
                              </div>
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
                        ) : (
                          <span className="text-[var(--color-text-muted)] text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {rows.slice(0, 4).map(row => {
              const avg = averageOf(row.id)
              return (
                <Card key={row.id} padding="sm">
                  <p className="font-semibold text-sm text-[var(--color-text)] truncate">{row.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">{row.number}</p>
                  {avg !== null ? (
                    <>
                      <p className="text-2xl font-bold text-[var(--color-text)]">
                        {avg.toFixed(2)}
                        <span className="text-sm font-normal text-[var(--color-text-muted)]">/20</span>
                      </p>
                      <Badge variant={avg >= 14 ? 'green' : avg >= 10 ? 'yellow' : 'red'} size="sm" className="mt-1">
                        {gradeLabel(avg)}
                      </Badge>
                    </>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">Aucune note</p>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      {canWrite && (
        <Modal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          title="Ajouter une note"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setAddOpen(false)}>Annuler</Button>
              <Button onClick={handleSaveGrade} loading={saving}>Enregistrer</Button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Élève"
              options={studentOpts}
              value={form.student_id}
              onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
              placeholder="Choisir un élève"
              required
              className="sm:col-span-2"
            />
            <Select
              label="Matière"
              options={subjectOpts}
              value={form.subject_id}
              onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
              placeholder="Choisir une matière"
              required
            />
            <Input
              label="Libellé de l’évaluation"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Contrôle 1"
              required
            />
            <Input
              label="Note obtenue"
              type="number"
              min="0"
              step="0.25"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder="15"
              required
            />
            <Input
              label="Note maximale"
              type="number"
              min="1"
              value={form.max_value}
              onChange={e => setForm(f => ({ ...f, max_value: e.target.value }))}
              placeholder="20"
            />
            <Input
              label="Date"
              type="date"
              value={form.grade_date}
              onChange={e => setForm(f => ({ ...f, grade_date: e.target.value }))}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Commentaire (optionnel)"
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Bon travail, mais des progrès à faire en…"
              />
            </div>
          </div>
        </Modal>
      )}
    </PageWrapper>
  )
}
