import supabase from '@/lib/supabase'

// Le schéma est décrit ici directement ; on passe par `any` comme dans AuthProvider.
const db = supabase as any

export type Trimester = 1 | 2 | 3

export interface SubjectRow {
  id: string
  name: string
  code: string
  coefficient: number
  color: string
}

export interface ClassStudent {
  id: string
  first_name: string
  last_name: string
  student_number: string
}

export interface GradeRow {
  id: string
  student_id: string
  subject_id: string
  classe_id: string
  trimester: Trimester
  value: number
  max_value: number
  label: string
  grade_date: string
  comment: string | null
  subjects: { name: string; code: string; coefficient: number; color: string } | null
  students: { first_name: string; last_name: string; student_number: string } | null
}

export interface NewGrade {
  student_id: string
  subject_id: string
  classe_id: string
  academic_year_id: string
  trimester: Trimester
  value: number
  max_value: number
  label: string
  grade_date: string
  comment: string | null
}

const GRADE_SELECT =
  'id, student_id, subject_id, classe_id, trimester, value, max_value, label, grade_date, comment, subjects(name, code, coefficient, color), students(first_name, last_name, student_number)'

export async function listSubjects(): Promise<SubjectRow[]> {
  const { data, error } = await db
    .from('subjects')
    .select('id, name, code, coefficient, color')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function listClassStudents(classeId: string): Promise<ClassStudent[]> {
  const { data, error } = await db
    .from('students')
    .select('id, first_name, last_name, student_number')
    .eq('classe_id', classeId)
    .eq('status', 'actif')
    .order('last_name')
  if (error) throw error
  return data ?? []
}

// classeId = null : la base ne renvoie que les notes visibles pour l'utilisateur connecté
// (ses enfants pour un parent, ses propres notes pour un élève).
export async function listGrades(classeId: string | null, trimester: Trimester): Promise<GradeRow[]> {
  let query = db
    .from('grades')
    .select(GRADE_SELECT)
    .eq('trimester', trimester)
    .order('grade_date', { ascending: false })

  if (classeId) query = query.eq('classe_id', classeId)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
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

export async function addGrade(grade: NewGrade): Promise<void> {
  const { error } = await db.from('grades').insert(grade)
  if (error) throw error
}

// Moyenne pondérée sur 20 : une moyenne par matière, puis pondération par coefficient.
export function computeAverage(
  grades: { subject_id: string; value: number; max_value: number; coefficient: number }[]
): number | null {
  if (grades.length === 0) return null

  const bySubject = new Map<string, { sum: number; count: number; coef: number }>()
  for (const g of grades) {
    const entry = bySubject.get(g.subject_id) ?? { sum: 0, count: 0, coef: g.coefficient }
    entry.sum += (g.value / g.max_value) * 20
    entry.count += 1
    bySubject.set(g.subject_id, entry)
  }

  let weighted = 0
  let totalCoef = 0
  for (const entry of bySubject.values()) {
    weighted += (entry.sum / entry.count) * entry.coef
    totalCoef += entry.coef
  }
  return totalCoef > 0 ? weighted / totalCoef : null
}
