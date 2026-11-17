import supabase from '@/lib/supabase'

const db = supabase as any

export const DAYS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
]

export interface SlotRow {
  id: string
  classe_id: string
  subject_id: string
  teacher_id: string
  room_id: string
  day_of_week: number
  start_minute: number
  end_minute: number
  subjects: { name: string; code: string; color: string } | null
  teachers: { full_name: string } | null
  rooms: { name: string } | null
}

export interface SlotInput {
  classe_id: string
  subject_id: string
  teacher_id: string
  room_id: string
  academic_year_id: string
  day_of_week: number
  start_minute: number
  end_minute: number
}

const SLOT_SELECT =
  'id, classe_id, subject_id, teacher_id, room_id, day_of_week, start_minute, end_minute, subjects(name, code, color), teachers(full_name), rooms(name)'

export async function listSlots(classeId: string): Promise<SlotRow[]> {
  const { data, error } = await db
    .from('timetable_slots')
    .select(SLOT_SELECT)
    .eq('classe_id', classeId)
    .order('start_minute')
  if (error) throw error
  return data ?? []
}

export async function createSlot(input: SlotInput): Promise<void> {
  const { error } = await db.from('timetable_slots').insert(input)
  if (error) throw error
}

export async function deleteSlot(id: string): Promise<void> {
  const { error } = await db.from('timetable_slots').delete().eq('id', id)
  if (error) throw error
}

export async function getCurrentAcademicYearId(): Promise<string> {
  const { data, error } = await db
    .from('academic_years')
    .select('id')
    .eq('is_current', true)
    .single()
  if (error) throw error
  return data.id
}

export function timeToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Messages lisibles pour les refus de la base.
export function describeTimetableError(err: unknown): string {
  const e = err as { code?: string; message?: string }
  if (e?.code === '23P01') {
    return 'Conflit : ce créneau chevauche un cours existant pour cet enseignant, cette salle ou cette classe.'
  }
  if (e?.code === '23514') return 'Horaire invalide : l’heure de fin doit être après l’heure de début.'
  if (e?.code === '42501') return 'Action réservée à la direction.'
  return e?.message ?? 'Erreur inconnue'
}
