import supabase from '@/lib/supabase'

// Schéma non décrit dans database.ts : on passe par `any`, comme ailleurs.
const db = supabase as any

export interface ClassRow {
  id: string
  name: string
  level: string
  capacity: number
  teacher_id: string | null
  room_id: string | null
  academic_year_id: string | null
  teachers: { full_name: string } | null
  rooms: { name: string } | null
  students: { id: string }[]
}

export interface SubjectRow {
  id: string
  name: string
  code: string
  coefficient: number
  color: string
}

export interface TeacherRow {
  id: string
  profile_id: string | null
  employee_number: string
  full_name: string
  specialty: string | null
  hire_date: string | null
  profiles: { email: string; phone: string | null } | null
}

export interface RoomRow {
  id: string
  name: string
  capacity: number
  building: string | null
  equipment: string[]
}

export interface ProfileSummary {
  id: string
  full_name: string
  email: string
}

export const LEVEL_OPTIONS = [
  '1ère année',
  '2ème année',
  '3ème année',
  '4ème année',
  '5ème année',
  '6ème année',
]

// ─── Classes ────────────────────────────────────────────────────────────────

export async function listClasses(): Promise<ClassRow[]> {
  const { data, error } = await db
    .from('classes')
    .select('id, name, level, capacity, teacher_id, room_id, academic_year_id, teachers(full_name), rooms(name), students(id)')
    .order('name')
  if (error) throw error
  return data ?? []
}

export interface ClassInput {
  name: string
  level: string
  capacity: number
  teacher_id: string | null
  room_id: string | null
}

export async function saveClass(input: ClassInput, id: string | null): Promise<void> {
  if (id) {
    const { error } = await db.from('classes').update(input).eq('id', id)
    if (error) throw error
    return
  }
  const { data: year, error: yearError } = await db
    .from('academic_years')
    .select('id')
    .eq('is_current', true)
    .single()
  if (yearError) throw yearError

  const { error } = await db.from('classes').insert({ ...input, academic_year_id: year.id })
  if (error) throw error
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await db.from('classes').delete().eq('id', id)
  if (error) throw error
}

// ─── Matières ───────────────────────────────────────────────────────────────

export async function listSubjects(): Promise<SubjectRow[]> {
  const { data, error } = await db
    .from('subjects')
    .select('id, name, code, coefficient, color')
    .order('name')
  if (error) throw error
  return data ?? []
}

export interface SubjectInput {
  name: string
  code: string
  coefficient: number
  color: string
}

export async function saveSubject(input: SubjectInput, id: string | null): Promise<void> {
  const { error } = id
    ? await db.from('subjects').update(input).eq('id', id)
    : await db.from('subjects').insert(input)
  if (error) throw error
}

// ─── Enseignants ────────────────────────────────────────────────────────────

export async function listTeachers(): Promise<TeacherRow[]> {
  const { data, error } = await db
    .from('teachers')
    .select('id, profile_id, employee_number, full_name, specialty, hire_date, profiles(email, phone)')
    .order('full_name')
  if (error) throw error
  return data ?? []
}

// Un enseignant doit être lié à un compte ayant le rôle « enseignant ».
export async function findTeacherAccount(email: string): Promise<ProfileSummary | null> {
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'enseignant')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export interface TeacherInput {
  full_name: string
  specialty: string | null
  hire_date: string | null
  profile_id: string | null
}

export async function saveTeacher(input: TeacherInput, id: string | null): Promise<void> {
  if (id) {
    const { error } = await db.from('teachers').update(input).eq('id', id)
    if (error) throw error
    return
  }
  const { error } = await db.from('teachers').insert({
    ...input,
    employee_number: `ENS-${Date.now().toString().slice(-6)}`,
  })
  if (error) throw error
}

// ─── Salles ─────────────────────────────────────────────────────────────────

export async function listRooms(): Promise<RoomRow[]> {
  const { data, error } = await db
    .from('rooms')
    .select('id, name, capacity, building, equipment')
    .order('name')
  if (error) throw error
  return data ?? []
}

export interface RoomInput {
  name: string
  capacity: number
  building: string | null
  equipment: string[]
}

export async function saveRoom(input: RoomInput, id: string | null): Promise<void> {
  const { error } = id
    ? await db.from('rooms').update(input).eq('id', id)
    : await db.from('rooms').insert(input)
  if (error) throw error
}

export async function deleteRoom(id: string): Promise<void> {
  const { error } = await db.from('rooms').delete().eq('id', id)
  if (error) throw error
}

// Classes visibles par l'utilisateur : la direction voit tout, l'enseignant seulement les siennes
// (titulaire ou affectation dans l'emploi du temps).
export async function listAccessibleClasses(profileId: string, role: string): Promise<ClassRow[]> {
  const all = await listClasses()
  if (role !== 'enseignant') return all

  const { data: teacher, error: teacherError } = await db
    .from('teachers')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (teacherError) throw teacherError
  if (!teacher) return []

  const { data: slots, error: slotsError } = await db
    .from('timetable_slots')
    .select('classe_id')
    .eq('teacher_id', teacher.id)
  if (slotsError) throw slotsError

  const assigned = new Set<string>((slots ?? []).map((s: { classe_id: string }) => s.classe_id))
  return all.filter(c => c.teacher_id === teacher.id || assigned.has(c.id))
}

export function describeAdminError(err: unknown): string {
  const e = err as { code?: string; message?: string }
  if (e?.code === '23505') return 'Ce nom existe déjà.'
  if (e?.code === '23503') return 'Cet élément est utilisé ailleurs et ne peut pas être supprimé.'
  if (e?.code === '42501') return 'Action réservée à la direction.'
  return e?.message ?? 'Erreur inconnue'
}
