import supabase from '@/lib/supabase'

const db = supabase as any

export type AttendanceStatus = 'present' | 'absent' | 'retard' | 'excuse'

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Présent',
  absent: 'Absent',
  retard: 'Retard',
  excuse: 'Excusé',
}

export interface AttendanceRow {
  id: string
  student_id: string
  classe_id: string
  attendance_date: string
  status: AttendanceStatus
  justification: string | null
  students: { first_name: string; last_name: string; student_number: string } | null
  classes: { name: string } | null
}

export interface RosterStudent {
  id: string
  first_name: string
  last_name: string
  student_number: string
}

const ROW_SELECT =
  'id, student_id, classe_id, attendance_date, status, justification, students(first_name, last_name, student_number), classes(name)'

export async function listRoster(classeId: string): Promise<RosterStudent[]> {
  const { data, error } = await db
    .from('students')
    .select('id, first_name, last_name, student_number')
    .eq('classe_id', classeId)
    .eq('status', 'actif')
    .order('last_name')
  if (error) throw error
  return data ?? []
}

export async function listAttendanceForDay(classeId: string, date: string): Promise<AttendanceRow[]> {
  const { data, error } = await db
    .from('attendance')
    .select(ROW_SELECT)
    .eq('classe_id', classeId)
    .eq('attendance_date', date)
  if (error) throw error
  return data ?? []
}

// Historique : sans classeId, la base ne renvoie que ce que l'utilisateur a le droit de voir
// (ses enfants pour un parent). Les présences sont affichées en lecture.
export async function listAttendanceHistory(classeId: string | null): Promise<AttendanceRow[]> {
  let query = db
    .from('attendance')
    .select(ROW_SELECT)
    .order('attendance_date', { ascending: false })
    .limit(200)
  if (classeId) query = query.eq('classe_id', classeId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// Enregistre l'appel complet d'une classe pour une date (création ou mise à jour).
export async function saveRoll(
  classeId: string,
  date: string,
  records: { student_id: string; status: AttendanceStatus }[]
): Promise<void> {
  const rows = records.map(r => ({
    classe_id: classeId,
    student_id: r.student_id,
    attendance_date: date,
    status: r.status,
  }))
  const { error } = await db
    .from('attendance')
    .upsert(rows, { onConflict: 'student_id,attendance_date' })
  if (error) throw error
}

export async function saveJustification(id: string, text: string): Promise<void> {
  const { error } = await db
    .from('attendance')
    .update({ justification: text.trim() || null })
    .eq('id', id)
  if (error) throw error
}

export function describeAttendanceError(err: unknown): string {
  const e = err as { code?: string; message?: string }
  if (e?.code === '42501') return 'Vous n’êtes pas autorisé à saisir les présences de cette classe.'
  if (e?.message?.includes("n'appartient pas")) return "Un élève ne peut être pointé que dans sa propre classe."
  return e?.message ?? 'Erreur inconnue'
}
