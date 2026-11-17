import { useState } from 'react'
import { AlertTriangle, Plus, Trash2, Info } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { DEMO_TIMETABLE, DEMO_CLASSES, DEMO_SUBJECTS, DEMO_TEACHERS, DEMO_ROOMS } from '@/lib/demo-data'
import type { TimetableSlot } from '@/types'
import { cn } from '@/lib/utils'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const HOURS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']

const CLASS_OPTS = DEMO_CLASSES.map(c => ({ value: c.id, label: c.name }))
const SUBJECT_OPTS = DEMO_SUBJECTS.map(s => ({ value: s.id, label: s.name }))
const TEACHER_OPTS = DEMO_TEACHERS.map(t => ({ value: t.id, label: t.full_name }))
const ROOM_OPTS = DEMO_ROOMS.map(r => ({ value: r.id, label: r.name }))

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function slotsOverlap(a: { start_time: string; end_time: string }, b: { start_time: string; end_time: string }) {
  return timeToMinutes(a.start_time) < timeToMinutes(b.end_time) &&
         timeToMinutes(b.start_time) < timeToMinutes(a.end_time)
}

export default function TimetablePage() {
  const { toast } = useToast()
  const [slots, setSlots] = useState<TimetableSlot[]>(DEMO_TIMETABLE as TimetableSlot[])
  const [selectedClass, setSelectedClass] = useState('class-ce1')
  const [addOpen, setAddOpen] = useState(false)
  const [conflict, setConflict] = useState<string | null>(null)
  const [form, setForm] = useState({
    day_of_week: '1', start_time: '08:00', end_time: '09:30',
    subject_id: '', teacher_id: '', room_id: '',
  })
  const [saving, setSaving] = useState(false)

  const filtered = slots.filter(s => s.classe_id === selectedClass)

  function detectConflict(newSlot: Partial<TimetableSlot>): string | null {
    for (const s of slots) {
      if (s.day_of_week !== newSlot.day_of_week) continue
      if (!slotsOverlap({ start_time: newSlot.start_time!, end_time: newSlot.end_time! }, s)) continue

      if (s.teacher_id === newSlot.teacher_id) {
        const t = DEMO_TEACHERS.find(t => t.id === s.teacher_id)
        return `⚠️ Conflit : ${t?.full_name} est déjà occupé(e) sur ce créneau (${s.start_time}–${s.end_time}).`
      }
      if (s.room_id === newSlot.room_id) {
        const r = DEMO_ROOMS.find(r => r.id === s.room_id)
        return `⚠️ Conflit : ${r?.name} est déjà réservée sur ce créneau (${s.start_time}–${s.end_time}).`
      }
      if (s.classe_id === selectedClass) {
        return `⚠️ Conflit : cette classe a déjà un cours sur ce créneau (${s.start_time}–${s.end_time}).`
      }
    }
    return null
  }

  function handleFormChange(field: string, value: string) {
    const updated = { ...form, [field]: value }
    setForm(updated)
    const c = detectConflict({
      day_of_week: +updated.day_of_week as 1|2|3|4|5|6,
      start_time: updated.start_time, end_time: updated.end_time,
      teacher_id: updated.teacher_id, room_id: updated.room_id,
      classe_id: selectedClass,
    })
    setConflict(c)
  }

  async function saveSlot() {
    if (conflict) { toast({ type: 'error', title: 'Conflit détecté', message: conflict }); return }
    if (!form.subject_id || !form.teacher_id || !form.room_id) {
      toast({ type: 'error', title: 'Champs manquants', message: 'Veuillez remplir tous les champs.' }); return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      classe_id: selectedClass,
      academic_year_id: 'ay-2025-2026',
      day_of_week: +form.day_of_week as 1|2|3|4|5|6,
      start_time: form.start_time,
      end_time: form.end_time,
      subject_id: form.subject_id,
      teacher_id: form.teacher_id,
      room_id: form.room_id,
      subject: DEMO_SUBJECTS.find(s => s.id === form.subject_id),
      teacher: DEMO_TEACHERS.find(t => t.id === form.teacher_id),
      room: DEMO_ROOMS.find(r => r.id === form.room_id),
    }
    setSlots(ss => [...ss, newSlot])
    toast({ type: 'success', title: 'Créneau ajouté', message: 'L\'emploi du temps a été mis à jour.' })
    setAddOpen(false)
    setSaving(false)
    setConflict(null)
  }

  function removeSlot(id: string) {
    setSlots(ss => ss.filter(s => s.id !== id))
    toast({ type: 'success', title: 'Créneau supprimé' })
  }

  // Build grid: for each day, get slots sorted by time
  function getSlotsForDay(day: number) {
    return filtered.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  return (
    <PageWrapper
      title="Emploi du temps"
      subtitle="Vue hebdomadaire — avec détection de conflits"
      actions={
        <div className="flex items-center gap-2">
          <Select
            options={CLASS_OPTS}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-36"
          />
          <Button icon={<Plus size={16} />} onClick={() => { setForm({ day_of_week:'1', start_time:'08:00', end_time:'09:30', subject_id:'', teacher_id:'', room_id:'' }); setConflict(null); setAddOpen(true) }}>
            Ajouter un créneau
          </Button>
        </div>
      }
    >
      {/* Weekly Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {DAYS.map((day, i) => {
          const daySlots = getSlotsForDay(i + 1)
          return (
            <Card key={day} padding="none" className="overflow-hidden">
              <div className="px-3 py-2 bg-[var(--color-forest)] text-center">
                <p className="text-white text-xs font-bold uppercase tracking-wide">{day}</p>
              </div>
              <div className="p-2 space-y-1.5 min-h-32">
                {daySlots.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-[var(--color-text-muted)] text-xs">Libre</div>
                ) : (
                  daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className="rounded-lg p-2 relative group"
                      style={{ backgroundColor: (slot.subject?.color ?? '#B8CDB8') + '25', borderLeft: `3px solid ${slot.subject?.color ?? '#B8CDB8'}` }}
                    >
                      <p className="text-[11px] font-bold text-[var(--color-text)] leading-tight">{slot.subject?.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{slot.start_time}–{slot.end_time}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{slot.teacher?.full_name?.split(' ').pop()}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{slot.room?.name}</p>
                      <button
                        onClick={() => removeSlot(slot.id)}
                        className="absolute top-1 right-1 hidden group-hover:flex w-5 h-5 items-center justify-center bg-red-100 text-red-500 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DEMO_SUBJECTS.map(sub => (
          <div key={sub.id} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: sub.color }} />
            <span className="text-xs text-[var(--color-text-muted)]">{sub.name}</span>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 p-3 bg-[var(--color-sage-light)] rounded-xl text-sm text-[var(--color-forest)]">
        <Info size={14} className="flex-shrink-0" />
        <span>Survolez un créneau pour le supprimer. La détection de conflits vérifie enseignant, salle et classe simultanément.</span>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ajouter un créneau" size="md"
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>Annuler</Button><Button onClick={saveSlot} loading={saving} variant={conflict ? 'danger' : 'primary'}>Ajouter</Button></>}>
        <div className="flex flex-col gap-4">
          {conflict && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{conflict}</span>
            </div>
          )}
          <Select label="Jour" value={form.day_of_week} onChange={e => handleFormChange('day_of_week', e.target.value)}
            options={DAYS.map((d, i) => ({ value: String(i+1), label: d }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Heure début" type="time" value={form.start_time} onChange={e => handleFormChange('start_time', e.target.value)} />
            <Input label="Heure fin" type="time" value={form.end_time} onChange={e => handleFormChange('end_time', e.target.value)} />
          </div>
          <Select label="Matière" value={form.subject_id} onChange={e => handleFormChange('subject_id', e.target.value)} options={SUBJECT_OPTS} placeholder="Choisir une matière" />
          <Select label="Enseignant" value={form.teacher_id} onChange={e => handleFormChange('teacher_id', e.target.value)} options={TEACHER_OPTS} placeholder="Choisir un enseignant" />
          <Select label="Salle" value={form.room_id} onChange={e => handleFormChange('room_id', e.target.value)} options={ROOM_OPTS} placeholder="Choisir une salle" />
        </div>
      </Modal>
    </PageWrapper>
  )
}
