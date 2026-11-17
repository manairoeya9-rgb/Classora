import supabase from '@/lib/supabase'
import { getCurrentAcademicYearId } from '@/features/grades/gradeService'

const db = supabase as any

export type PaymentMethod = 'especes' | 'virement' | 'mobile_money' | 'cheque'
export type FeeStatus = 'impaye' | 'partiel' | 'paye'

export const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'especes', label: 'Espèces' },
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cheque', label: 'Chèque' },
]

export interface StudentFeeRow {
  id: string
  student_id: string
  amount_due: number
  amount_paid: number
  status: FeeStatus
  fee_types: { name: string; is_mandatory: boolean } | null
  students: {
    first_name: string
    last_name: string
    student_number: string
    classes: { name: string } | null
  } | null
}

export interface PaymentRow {
  id: string
  student_fee_id: string
  student_id: string
  amount: number
  payment_date: string
  method: PaymentMethod
  receipt_number: string
  notes: string | null
  students: { first_name: string; last_name: string } | null
}

export interface FeeTypeRow {
  id: string
  name: string
  amount: number
  is_mandatory: boolean
  due_date: string | null
  academic_year_id: string
}

export interface PaymentReceiptData {
  receipt_number: string
  payment_date: string
}

export async function listStudentFees(): Promise<StudentFeeRow[]> {
  const { data, error } = await db
    .from('student_fees')
    .select(
      'id, student_id, amount_due, amount_paid, status, fee_types(name, is_mandatory), students(first_name, last_name, student_number, classes(name))'
    )
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listPayments(): Promise<PaymentRow[]> {
  const { data, error } = await db
    .from('payments')
    .select('id, student_fee_id, student_id, amount, payment_date, method, receipt_number, notes, students(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data ?? []
}

export async function listFeeTypes(): Promise<FeeTypeRow[]> {
  const { data, error } = await db
    .from('fee_types')
    .select('id, name, amount, is_mandatory, due_date, academic_year_id')
    .order('name')
  if (error) throw error
  return data ?? []
}

// Enregistre un encaissement. La base vérifie le solde, met à jour le frais,
// et attribue le numéro de reçu. Le paiement ne peut plus être modifié ensuite.
export async function recordPayment(input: {
  student_fee_id: string
  student_id: string
  amount: number
  method: PaymentMethod
  notes: string | null
}): Promise<PaymentReceiptData> {
  const { data, error } = await db
    .from('payments')
    .insert(input)
    .select('receipt_number, payment_date')
    .single()
  if (error) throw error
  return data
}

// Crée un type de frais et l'affecte à tous les élèves actifs.
export async function createFeeType(input: {
  name: string
  amount: number
  due_date: string | null
  is_mandatory: boolean
}): Promise<void> {
  const academicYearId = await getCurrentAcademicYearId()

  const { data: feeType, error: feeError } = await db
    .from('fee_types')
    .insert({ ...input, academic_year_id: academicYearId })
    .select('id')
    .single()
  if (feeError) throw feeError

  const { data: students, error: studentsError } = await db
    .from('students')
    .select('id')
    .eq('status', 'actif')
  if (studentsError) throw studentsError

  if ((students ?? []).length > 0) {
    const rows = students.map((s: { id: string }) => ({
      student_id: s.id,
      fee_type_id: feeType.id,
      academic_year_id: academicYearId,
      amount_due: input.amount,
    }))
    const { error } = await db
      .from('student_fees')
      .upsert(rows, { onConflict: 'student_id,fee_type_id', ignoreDuplicates: true })
    if (error) throw error
  }
}

export function describeFeeError(err: unknown): string {
  const e = err as { code?: string; message?: string }
  if (e?.code === '42501') return 'Action réservée au secrétariat et à la direction.'
  if (e?.code === '23505') return 'Ce frais existe déjà pour cette année.'
  return e?.message ?? 'Erreur inconnue'
}
