// ─── Global TypeScript Types ──────────────────────────────────────────────────

export type UserRole = 'admin' | 'enseignant' | 'parent' | 'eleve' | 'secretariat'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  phone?: string
  created_at: string
}

export interface AcademicYear {
  id: string
  label: string
  start_date: string
  end_date: string
  is_current: boolean
}

export interface Classe {
  id: string
  name: string
  level: string
  teacher_id?: string
  academic_year_id: string
  room_id?: string
  capacity: number
  teacher?: Teacher
  room?: Room
  student_count?: number
}

export interface Subject {
  id: string
  name: string
  code: string
  coefficient: number
  color: string
}

export interface Teacher {
  id: string
  profile_id: string
  employee_number: string
  full_name: string
  email: string
  phone?: string
  specialty: string
  avatar_url?: string
  hire_date: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  building?: string
  equipment?: string[]
}

export interface Student {
  id: string
  student_number: string
  first_name: string
  last_name: string
  full_name: string
  birth_date: string
  gender: 'M' | 'F'
  classe_id?: string
  classe?: Classe
  photo_url?: string
  address?: string
  enrollment_date: string
  academic_year_id: string
  status: 'actif' | 'inactif' | 'transfere'
  parents?: Parent[]
}

export interface Parent {
  id: string
  student_id: string
  full_name: string
  relationship: 'pere' | 'mere' | 'tuteur' | 'autre'
  phone: string
  email?: string
  address?: string
  profession?: string
  is_primary: boolean
  profile_id?: string
}

export interface TimetableSlot {
  id: string
  classe_id: string
  subject_id: string
  teacher_id: string
  room_id: string
  day_of_week: 1 | 2 | 3 | 4 | 5 | 6
  start_time: string
  end_time: string
  academic_year_id: string
  classe?: Classe
  subject?: Subject
  teacher?: Teacher
  room?: Room
}

export interface Grade {
  id: string
  student_id: string
  subject_id: string
  classe_id: string
  academic_year_id: string
  trimester: 1 | 2 | 3
  value: number
  max_value: number
  label: string
  date: string
  comment?: string
  student?: Student
  subject?: Subject
}

export interface ReportCard {
  id: string
  student_id: string
  classe_id: string
  academic_year_id: string
  trimester: 1 | 2 | 3
  general_average: number
  rank?: number
  teacher_comment?: string
  director_comment?: string
  is_published: boolean
  generated_at?: string
}

export interface Attendance {
  id: string
  student_id: string
  classe_id: string
  date: string
  status: 'present' | 'absent' | 'retard' | 'excuse'
  justification?: string
  justification_url?: string
  noted_by: string
  student?: Student
}

export interface FeeType {
  id: string
  name: string
  amount: number
  academic_year_id: string
  due_date?: string
  is_mandatory: boolean
  description?: string
}

export interface StudentFee {
  id: string
  student_id: string
  fee_type_id: string
  amount_due: number
  amount_paid: number
  status: 'impaye' | 'partiel' | 'paye'
  academic_year_id: string
  student?: Student
  fee_type?: FeeType
}

export interface Payment {
  id: string
  student_fee_id: string
  student_id: string
  amount: number
  payment_date: string
  method: 'especes' | 'virement' | 'mobile_money' | 'cheque'
  receipt_number: string
  recorded_by: string
  notes?: string
  student?: Student
}

export interface Homework {
  id: string
  title: string
  description: string
  subject_id: string
  classe_id: string
  teacher_id: string
  due_date: string
  published_at: string
  attachment_url?: string
  subject?: Subject
  classe?: Classe
  teacher?: Teacher
  submission_count?: number
}

export interface Submission {
  id: string
  homework_id: string
  student_id: string
  submitted_at: string
  content?: string
  attachment_url?: string
  grade?: number
  feedback?: string
  corrected_at?: string
  status: 'soumis' | 'corrige' | 'en_retard'
  student?: Student
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  body: string
  sent_at: string
  read_at?: string
  is_archived: boolean
  sender?: Profile
  recipient?: Profile
}

export interface Announcement {
  id: string
  title: string
  body: string
  author_id: string
  target_roles: UserRole[]
  published_at: string
  expires_at?: string
  is_pinned: boolean
  author?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'error'
  link?: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  user_name: string
  action: string
  table_name: string
  record_id: string
  changes?: Record<string, unknown>
  created_at: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// ─── Form State ───────────────────────────────────────────────────────────────
export type FormMode = 'create' | 'edit' | 'view'
