import { useState } from 'react'
import { Plus, BookOpen, CheckCircle, Clock, Upload, Send } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { DEMO_HOMEWORK, DEMO_CLASSES, DEMO_SUBJECTS, DEMO_STUDENTS } from '@/lib/demo-data'
import { useAuth } from '@/features/auth/AuthProvider'
import type { Homework, Submission } from '@/types'
import { cn } from '@/lib/utils'

const CLASS_OPTS = DEMO_CLASSES.map(c => ({ value: c.id, label: c.name }))
const SUBJECT_OPTS = DEMO_SUBJECTS.map(s => ({ value: s.id, label: s.name }))

export default function HomeworkPage() {
  const { toast } = useToast()
  const { user, isRole } = useAuth()
  const [homework, setHomework] = useState<Homework[]>(DEMO_HOMEWORK as Homework[])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [viewHw, setViewHw] = useState<Homework | null>(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', classe_id: '', due_date: '' })
  const [submitForm, setSubmitForm] = useState({ content: '' })
  const [correctForm, setCorrectForm] = useState<Record<string, { grade: string; feedback: string }>>({})

  async function handleAddHomework() {
    if (!form.title || !form.subject_id || !form.classe_id || !form.due_date) {
      toast({ type: 'error', title: 'Champs manquants' }); return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    const hw: Homework = {
      id: `hw-${Date.now()}`,
      ...form,
      teacher_id: 'teacher-1',
      published_at: new Date().toISOString(),
      subject: DEMO_SUBJECTS.find(s => s.id === form.subject_id),
      classe: DEMO_CLASSES.find(c => c.id === form.classe_id),
    }
    setHomework(hs => [...hs, hw])
    toast({ type: 'success', title: 'Devoir publié', message: `"${form.title}" a été publié pour la classe.` })
    setAddOpen(false)
    setSaving(false)
  }

  async function handleSubmit() {
    if (!viewHw || !submitForm.content.trim()) {
      toast({ type: 'error', title: 'Veuillez rédiger votre réponse' }); return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const sub: Submission = {
      id: `sub-${Date.now()}`,
      homework_id: viewHw.id,
      student_id: 'stu-1',
      submitted_at: new Date().toISOString(),
      content: submitForm.content,
      status: 'soumis',
      student: DEMO_STUDENTS[0],
    }
    setSubmissions(ss => [...ss, sub])
    toast({ type: 'success', title: 'Devoir rendu !', message: 'Votre enseignant corrigera bientôt votre travail.' })
    setSubmitOpen(false)
    setSaving(false)
  }

  async function handleCorrect(subId: string) {
    const cf = correctForm[subId]
    if (!cf?.grade) { toast({ type: 'error', title: 'Saisissez une note' }); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSubmissions(ss => ss.map(s => s.id === subId ? { ...s, grade: +cf.grade, feedback: cf.feedback, status: 'corrige' as const, corrected_at: new Date().toISOString() } : s))
    toast({ type: 'success', title: 'Correction enregistrée' })
    setSaving(false)
  }

  const hwForRole = isRole('eleve')
    ? homework.filter(hw => hw.classe_id === 'class-cp')
    : isRole('enseignant')
    ? homework
    : homework

  return (
    <PageWrapper
      title="Devoirs"
      subtitle={isRole('eleve') ? 'Mes devoirs à rendre' : 'Publication et correction des devoirs'}
      actions={
        isRole('admin', 'enseignant') ? (
          <Button icon={<Plus size={16} />} onClick={() => { setForm({ title:'', description:'', subject_id:'', classe_id:'', due_date:'' }); setAddOpen(true) }}>
            Publier un devoir
          </Button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hwForRole.map(hw => {
          const hwSubs = submissions.filter(s => s.homework_id === hw.id)
          const mySubmission = hwSubs.find(s => s.student_id === 'stu-1')
          const isPast = new Date(hw.due_date) < new Date()

          return (
            <Card key={hw.id} className="cursor-pointer card-hover" onClick={() => setViewHw(hw)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: hw.subject?.color + '30' }}>
                  <BookOpen size={16} style={{ color: hw.subject?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-text)] leading-tight">{hw.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{hw.subject?.name} • {hw.classe?.name}</p>
                </div>
                {isPast ? (
                  <Badge variant="red" size="sm" dot>Délai dépassé</Badge>
                ) : (
                  <Badge variant="green" size="sm" dot>En cours</Badge>
                )}
              </div>

              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">{hw.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Clock size={12} />
                  <span>Pour le {formatDate(hw.due_date)}</span>
                </div>
                {isRole('eleve') ? (
                  mySubmission ? (
                    <Badge variant={mySubmission.status === 'corrige' ? 'green' : 'blue'} size="sm">
                      {mySubmission.status === 'corrige' ? `✓ Noté ${mySubmission.grade}/20` : 'Rendu ✓'}
                    </Badge>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setViewHw(hw); setSubmitOpen(true) }}>
                      Rendre
                    </Button>
                  )
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">{hwSubs.length} rendu(s)</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Corrections panel for teacher */}
      {isRole('admin', 'enseignant') && submissions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">Corrections à faire ({submissions.filter(s => s.status === 'soumis').length})</h3>
          <div className="space-y-3">
            {submissions.filter(s => s.status === 'soumis').map(sub => (
              <Card key={sub.id} padding="sm">
                <div className="flex items-start gap-3">
                  <Avatar name={sub.student?.full_name ?? ''} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{sub.student?.full_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">{formatDate(sub.submitted_at)}</p>
                    <p className="text-sm bg-[var(--color-ivory)] p-2 rounded-lg mb-3">{sub.content}</p>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Note /20" type="number" min="0" max="20"
                        value={correctForm[sub.id]?.grade ?? ''}
                        onChange={e => setCorrectForm(cf => ({ ...cf, [sub.id]: { ...cf[sub.id], grade: e.target.value } }))}
                        className="w-24"
                      />
                      <Input
                        placeholder="Commentaire de correction…"
                        value={correctForm[sub.id]?.feedback ?? ''}
                        onChange={e => setCorrectForm(cf => ({ ...cf, [sub.id]: { ...cf[sub.id], feedback: e.target.value } }))}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleCorrect(sub.id)} loading={saving}>Corriger</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Homework Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Publier un devoir" size="md"
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>Annuler</Button><Button icon={<Send size={14} />} onClick={handleAddHomework} loading={saving}>Publier</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Titre" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Exercices de multiplication" required />
          <Textarea label="Description / Consignes" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Détaillez les exercices à effectuer…" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Matière" options={SUBJECT_OPTS} value={form.subject_id} onChange={e => setForm(f => ({...f, subject_id: e.target.value}))} placeholder="Choisir" required />
            <Select label="Classe" options={CLASS_OPTS} value={form.classe_id} onChange={e => setForm(f => ({...f, classe_id: e.target.value}))} placeholder="Choisir" required />
          </div>
          <Input label="Date limite de rendu" type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} required />
        </div>
      </Modal>

      {/* Submit Modal (student) */}
      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title={`Rendre : ${viewHw?.title}`} size="md"
        footer={<><Button variant="ghost" onClick={() => setSubmitOpen(false)}>Annuler</Button><Button icon={<Send size={14} />} onClick={handleSubmit} loading={saving}>Remettre le devoir</Button></>}>
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-[var(--color-ivory)] rounded-xl">
            <p className="text-sm font-medium">{viewHw?.description}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Pour le {viewHw && formatDate(viewHw.due_date)}</p>
          </div>
          <Textarea label="Votre réponse" value={submitForm.content} onChange={e => setSubmitForm({ content: e.target.value })} placeholder="Écrivez votre réponse ici…" rows={6} required />
        </div>
      </Modal>
    </PageWrapper>
  )
}
