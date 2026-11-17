import { useEffect, useState } from 'react'
import { Plus, Trash2, Info } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import supabase from '@/lib/supabase'
import {
  listClasses, listSubjects, listTeachers, listRooms,
  describeAdminError,
  type ClassRow, type SubjectRow, type TeacherRow, type RoomRow,
} from '@/features/classes/adminService'
import {
  DAYS, listSlots, createSlot, deleteSlot, getCurrentAcademicYearId,
  timeToMinutes, minutesToTime, describeTimetableError,
  type SlotRow,
} from '@/features/timetable/timetableService'

const EMPTY_FORM = {
  day: '1',
  start: '08:00',
  end: '09:00',
  subject_id: '',
  teacher_id: '',
  room_id: '',
}

export default function TimetablePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const canManage = user?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [rooms, setRooms] = useState<RoomRow[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [slots, setSlots] = useState<SlotRow[]>([])

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  // Chargement des références
  useEffect(() => {
    async function init() {
      try {
        const [c, s, t, r] = await Promise.all([listClasses(), listSubjects(), listTeachers(), listRooms()])
        setClasses(c)
        setSubjects(s)
        setTeachers(t)
        setRooms(r)

        // Élève : par défaut, sa propre classe
        let initial = c[0]?.id ?? ''
        if (user?.role === 'eleve') {
          const { data } = await (supabase as any)
            .from('students')
            .select('classe_id')
            .eq('profile_id', user.id)
            .maybeSingle()
          if (data?.classe_id) initial = data.classe_id
        }
        setSelectedClass(initial)
      } catch (err) {
        toast({ type: 'error', title: 'Chargement impossible', message: describeAdminError(err) })
      } finally {
        setLoading(false)
      }
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function loadSlots() {
    if (!selectedClass) { setSlots([]); return }
    try {
      setSlots(await listSlots(selectedClass))
    } catch (err) {
      toast({ type: 'error', title: 'Chargement impossible', message: describeAdminError(err) })
    }
  }

  useEffect(() => {
    void loadSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass])

  function openAdd(day?: number) {
    setForm({ ...EMPTY_FORM, day: String(day ?? 1) })
    setAddOpen(true)
  }

  async function submitSlot() {
    const start = timeToMinutes(form.start)
    const end = timeToMinutes(form.end)

    if (!form.subject_id || !form.teacher_id || !form.room_id) {
      toast({ type: 'error', title: 'Champs manquants', message: 'Matière, enseignant et salle sont requis.' })
      return
    }
    if (end <= start) {
      toast({ type: 'error', title: 'Horaire invalide', message: 'L’heure de fin doit être après l’heure de début.' })
      return
    }

    setSaving(true)
    try {
      const academicYearId = await getCurrentAcademicYearId()
      await createSlot({
        classe_id: selectedClass,
        subject_id: form.subject_id,
        teacher_id: form.teacher_id,
        room_id: form.room_id,
        academic_year_id: academicYearId,
        day_of_week: Number(form.day),
        start_minute: start,
        end_minute: end,
      })
      toast({ type: 'success', title: 'Créneau ajouté' })
      setAddOpen(false)
      await loadSlots()
    } catch (err) {
      // La base détecte les conflits enseignant / salle / classe
      toast({ type: 'error', title: 'Créneau refusé', message: describeTimetableError(err) })
    } finally {
      setSaving(false)
    }
  }

  async function removeSlot(id: string) {
    try {
      await deleteSlot(id)
      toast({ type: 'success', title: 'Créneau supprimé' })
      await loadSlots()
    } catch (err) {
      toast({ type: 'error', title: 'Suppression impossible', message: describeTimetableError(err) })
    }
  }

  if (loading) return <PageLoading message="Chargement de l’emploi du temps…" />

  const classOpts = classes.map(c => ({ value: c.id, label: c.name }))
  const subjectOpts = subjects.map(s => ({ value: s.id, label: s.name }))
  const teacherOpts = teachers.map(t => ({ value: t.id, label: t.full_name }))
  const roomOpts = rooms.map(r => ({ value: r.id, label: r.name }))

  return (
    <PageWrapper
      title="Emploi du temps"
      subtitle="Planning hebdomadaire du lundi au vendredi — conflits détectés automatiquement"
      actions={
        <div className="flex items-center gap-2">
          <Select options={classOpts} value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-40" />
          {canManage && selectedClass && (
            <Button icon={<Plus size={16} />} onClick={() => openAdd()}>Ajouter un créneau</Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {DAYS.map(day => {
          const daySlots = slots.filter(s => s.day_of_week === day.value)
          return (
            <Card key={day.value} padding="none" className="overflow-hidden">
              <div className="px-3 py-2 bg-[var(--color-forest)] text-center">
                <p className="text-white text-xs font-bold uppercase tracking-wide">{day.label}</p>
              </div>
              <div className="p-2 space-y-1.5 min-h-32">
                {daySlots.length === 0 ? (
                  <div
                    className="flex items-center justify-center h-24 text-[var(--color-text-muted)] text-xs cursor-pointer"
                    onClick={() => canManage && selectedClass && openAdd(day.value)}
                  >
                    Libre
                  </div>
                ) : (
                  daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className="rounded-lg p-2 relative group"
                      style={{
                        backgroundColor: (slot.subjects?.color ?? '#B8CDB8') + '25',
                        borderLeft: `3px solid ${slot.subjects?.color ?? '#B8CDB8'}`,
                      }}
                    >
                      <p className="text-[11px] font-bold text-[var(--color-text)] leading-tight">{slot.subjects?.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {minutesToTime(slot.start_minute)}–{minutesToTime(slot.end_minute)}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{slot.teachers?.full_name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{slot.rooms?.name}</p>
                      {canManage && (
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="absolute top-1 right-1 hidden group-hover:flex w-5 h-5 items-center justify-center bg-red-100 text-red-500 rounded hover:bg-red-200 transition-colors"
                          title="Supprimer ce créneau"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center gap-2 p-3 bg-[var(--color-sage-light)] rounded-xl text-sm text-[var(--color-forest)]">
        <Info size={14} className="flex-shrink-0" />
        <span>
          Récréations (10h00–10h10 et 15h00–15h10) et pause déjeuner (12h00–14h00) ne sont pas des cours.
          Mercredi après-midi libre.
        </span>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter un créneau"
        size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Annuler</Button>
          <Button onClick={submitSlot} loading={saving}>Ajouter</Button>
        </>}
      >
        <div className="flex flex-col gap-4">
          <Select label="Jour" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} options={DAYS.map(d => ({ value: String(d.value), label: d.label }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Heure de début" type="time" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
            <Input label="Heure de fin" type="time" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
          <Select label="Matière" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} options={subjectOpts} placeholder="Choisir une matière" />
          <Select label="Enseignant" value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))} options={teacherOpts} placeholder="Choisir un enseignant" />
          <Select label="Salle" value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))} options={roomOpts} placeholder="Choisir une salle" />
        </div>
      </Modal>
    </PageWrapper>
  )
}
