import supabase from '@/lib/supabase'

// Les tables scolaires ne sont pas encore décrites dans database.ts.
// Comme dans AuthProvider, on passe par `any` pour ces appels.
const db = supabase as any

export type Gender = 'M' | 'F'
export type Relationship = 'pere' | 'mere' | 'tuteur' | 'autre'
export type StudentStatus = 'actif' | 'inactif' | 'transfere'

export interface ClassRow {
  id: string
  name: string
  level: string
}

export interface ProfileSummary {
  id: string
  full_name: string
  email: string
  phone: string | null
}

export interface StudentRow {
  id: string
  student_number: string
  first_name: string
  last_name: string
  birth_date: string
  gender: Gender
  classe_id: string | null
  status: StudentStatus
  enrollment_date: string
  profile_id: string | null
  classes: { name: string } | null
  parents: {
    id: string
    relationship: Relationship
    is_primary: boolean
    profiles: ProfileSummary
  }[]
  student_profile: ProfileSummary | null
}

export interface StudentInput {
  first_name: string
  last_name: string
  birth_date: string
  gender: Gender
  classe_id: string | null
  status: StudentStatus
  profile_id: string | null
}

export interface ParentLink {
  profileId: string
  relationship: Relationship
}

export interface ChildRecord {
  id: string
  student_number: string
  first_name: string
  last_name: string
  birth_date: string
  gender: Gender
  status: StudentStatus
  classes: { name: string } | null
}

export interface LinkedChild {
  relationship: Relationship
  student: ChildRecord
}

const STUDENT_SELECT =
  'id, student_number, first_name, last_name, birth_date, gender, classe_id, status, enrollment_date, profile_id, classes(name), parents(id, relationship, is_primary, profiles(id, full_name, email, phone)), student_profile:profiles(id, full_name, email, phone)'

const CHILD_SELECT =
  'id, student_number, first_name, last_name, birth_date, gender, status, classes(name)'

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export async function listClasses(): Promise<ClassRow[]> {
  const { data, error } = await db
    .from('classes')
    .select('id, name, level')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function listStudents(): Promise<StudentRow[]> {
  const { data, error } = await db
    .from('students')
    .select(STUDENT_SELECT)
    .order('last_name')
  if (error) throw error
  return data ?? []
}

// Recherche un parent déjà inscrit à partir de son téléphone.
// Compare les chiffres seulement, pour accepter « +216 96 456 789 » ou « 96456789 ».
export async function findParentsByPhone(phone: string): Promise<ProfileSummary[]> {
  const wanted = digitsOnly(phone).slice(-8)
  if (wanted.length < 8) return []

  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('role', 'parent')
    .not('phone', 'is', null)
  if (error) throw error

  return (data ?? []).filter((p: ProfileSummary) =>
    digitsOnly(p.phone ?? '').endsWith(wanted)
  )
}

// Recherche un compte élève (rôle « eleve ») par son e-mail.
export async function findStudentAccountByEmail(
  email: string
): Promise<ProfileSummary | null> {
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('role', 'eleve')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

function newStudentNumber(): string {
  const year = new Date().getFullYear()
  return `EL-${year}-${String(Date.now()).slice(-6)}`
}

export async function createStudent(
  input: StudentInput,
  parent: ParentLink
): Promise<void> {
  const { data: created, error } = await db
    .from('students')
    .insert({ ...input, student_number: newStudentNumber() })
    .select('id')
    .single()
  if (error) throw error

  const { error: linkError } = await db.from('parents').insert({
    student_id: created.id,
    profile_id: parent.profileId,
    relationship: parent.relationship,
    is_primary: true,
  })

  // Si le lien échoue, on retire la fiche élève créée à l'instant
  // pour ne pas laisser un élève sans parent.
  if (linkError) {
    await db.from('students').delete().eq('id', created.id)
    throw linkError
  }
}

export async function updateStudent(
  id: string,
  input: StudentInput,
  parent: ParentLink
): Promise<void> {
  const { error } = await db.from('students').update(input).eq('id', id)
  if (error) throw error

  const { error: deleteError } = await db
    .from('parents')
    .delete()
    .eq('student_id', id)
  if (deleteError) throw deleteError

  const { error: linkError } = await db.from('parents').insert({
    student_id: id,
    profile_id: parent.profileId,
    relationship: parent.relationship,
    is_primary: true,
  })
  if (linkError) throw linkError
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await db.from('students').delete().eq('id', id)
  if (error) throw error
}

// Enfants rattachés au compte parent connecté.
export async function getMyChildren(profileId: string): Promise<LinkedChild[]> {
  const { data, error } = await db
    .from('parents')
    .select(`relationship, students(${CHILD_SELECT})`)
    .eq('profile_id', profileId)
  if (error) throw error

  return (data ?? [])
    .filter((row: { students: ChildRecord | null }) => row.students)
    .map((row: { relationship: Relationship; students: ChildRecord }) => ({
      relationship: row.relationship,
      student: row.students,
    }))
}

// Fiche élève rattachée au compte élève connecté.
export async function getMyStudentRecord(
  profileId: string
): Promise<ChildRecord | null> {
  const { data, error } = await db
    .from('students')
    .select(CHILD_SELECT)
    .eq('profile_id', profileId)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}
