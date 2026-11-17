import { useEffect, useMemo, useState } from 'react'
import { Banknote, Plus, CreditCard, FileCheck } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { DataTable } from '@/components/ui/DataTable'
import { Card, StatCard } from '@/components/ui/Card'
import { FeeBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/utils'
import {
  listStudentFees, listPayments, listFeeTypes, recordPayment, createFeeType,
  describeFeeError, METHOD_OPTIONS,
  type StudentFeeRow, type PaymentRow, type FeeTypeRow, type PaymentMethod,
} from '@/features/fees/feesService'

const EMPTY_PAYMENT = { amount: '', method: 'especes' as PaymentMethod, notes: '' }
const EMPTY_FEE_TYPE = { name: '', amount: '', due_date: '', is_mandatory: true }

export default function FeesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const role = user?.role
  const canRecord = role === 'admin' || role === 'secretariat'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fees, setFees] = useState<StudentFeeRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [feeTypes, setFeeTypes] = useState<FeeTypeRow[]>([])

  const [payTarget, setPayTarget] = useState<StudentFeeRow | null>(null)
  const [payForm, setPayForm] = useState(EMPTY_PAYMENT)
  const [feeTypeOpen, setFeeTypeOpen] = useState(false)
  const [feeTypeForm, setFeeTypeForm] = useState(EMPTY_FEE_TYPE)

  async function load() {
    try {
      const [f, p, t] = await Promise.all([listStudentFees(), listPayments(), listFeeTypes()])
      setFees(f)
      setPayments(p)
      setFeeTypes(t)
    } catch (err) {
      toast({ type: 'error', title: 'Chargement impossible', message: describeFeeError(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (role) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const totals = useMemo(() => {
    const due = fees.reduce((s, f) => s + Number(f.amount_due), 0)
    const paid = fees.reduce((s, f) => s + Number(f.amount_paid), 0)
    return {
      due,
      paid,
      outstanding: due - paid,
      unpaid: fees.filter(f => f.status !== 'paye').length,
    }
  }, [fees])

  function openPayment(fee: StudentFeeRow) {
    const balance = Number(fee.amount_due) - Number(fee.amount_paid)
    setPayForm({ amount: String(balance), method: 'especes', notes: '' })
    setPayTarget(fee)
  }

  // Reçu PDF avec le numéro attribué par la base
  async function downloadReceipt(
    receiptNumber: string,
    paymentDate: string,
    studentName: string,
    feeName: string,
    amount: number,
    method: PaymentMethod,
    remaining: number,
  ) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ format: 'a5' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('CLASSORA — REÇU DE PAIEMENT', 74, 20, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`N° Reçu : ${receiptNumber}`, 20, 35)
    doc.text(`Date : ${formatDate(paymentDate)}`, 20, 42)
    doc.text(`Élève : ${studentName}`, 20, 52)
    doc.text(`Type de frais : ${feeName}`, 20, 59)
    doc.text(`Montant payé : ${formatCurrency(amount)}`, 20, 66)
    const methodLabel = METHOD_OPTIONS.find(m => m.value === method)?.label ?? method
    doc.text(`Mode de paiement : ${methodLabel}`, 20, 73)
    doc.text(`Solde restant : ${formatCurrency(remaining)}`, 20, 80)
    doc.setFont('helvetica', 'bold')
    doc.text('Merci de votre paiement — Classora École Primaire', 74, 100, { align: 'center' })
    doc.save(`recu-${receiptNumber}.pdf`)
  }

  async function handlePayment() {
    if (!payTarget) return
    const balance = Number(payTarget.amount_due) - Number(payTarget.amount_paid)
    const amount = Number(payForm.amount)

    if (!amount || amount <= 0) {
      toast({ type: 'error', title: 'Montant invalide', message: 'Le montant doit être supérieur à zéro.' })
      return
    }
    if (amount > balance) {
      toast({ type: 'error', title: 'Montant trop élevé', message: `Le solde restant est de ${formatCurrency(balance)}.` })
      return
    }

    setSaving(true)
    try {
      const receipt = await recordPayment({
        student_fee_id: payTarget.id,
        student_id: payTarget.student_id,
        amount,
        method: payForm.method,
        notes: payForm.notes.trim() || null,
      })
      const studentName = `${payTarget.students?.first_name ?? ''} ${payTarget.students?.last_name ?? ''}`.trim()
      await downloadReceipt(
        receipt.receipt_number,
        receipt.payment_date,
        studentName,
        payTarget.fee_types?.name ?? '',
        amount,
        payForm.method,
        balance - amount,
      )
      toast({ type: 'success', title: 'Paiement enregistré', message: `Reçu ${receipt.receipt_number} téléchargé.` })
      setPayTarget(null)
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Paiement refusé', message: describeFeeError(err) })
    } finally {
      setSaving(false)
    }
  }

  async function submitFeeType() {
    const amount = Number(feeTypeForm.amount)
    if (!feeTypeForm.name.trim() || !amount || amount < 0) {
      toast({ type: 'error', title: 'Champs manquants', message: 'Nom et montant (TND) sont requis.' })
      return
    }
    setSaving(true)
    try {
      await createFeeType({
        name: feeTypeForm.name.trim(),
        amount,
        due_date: feeTypeForm.due_date || null,
        is_mandatory: feeTypeForm.is_mandatory,
      })
      toast({ type: 'success', title: 'Frais créé', message: 'Affecté à tous les élèves actifs.' })
      setFeeTypeOpen(false)
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Création impossible', message: describeFeeError(err) })
    } finally {
      setSaving(false)
    }
  }

  if (!role || loading) return <PageLoading message="Chargement des frais…" />

  const methodLabel = (m: PaymentMethod) => METHOD_OPTIONS.find(o => o.value === m)?.label ?? m

  return (
    <PageWrapper
      title="Frais de scolarité"
      subtitle={canRecord ? 'Encaissements, soldes et reçus' : 'Situation financière de vos enfants'}
      actions={canRecord ? (
        <Button variant="secondary" icon={<Plus size={16} />} onClick={() => { setFeeTypeForm(EMPTY_FEE_TYPE); setFeeTypeOpen(true) }}>
          Nouveau type de frais
        </Button>
      ) : undefined}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total attendu" value={formatCurrency(totals.due)} icon={<CreditCard size={18} />} color="forest" />
        <StatCard title="Total encaissé" value={formatCurrency(totals.paid)} icon={<Banknote size={18} />} color="sage" />
        <StatCard title="Solde impayé" value={formatCurrency(totals.outstanding)} subtitle={`${totals.unpaid} frais non soldé(s)`} icon={<FileCheck size={18} />} color="coral" />
      </div>

      {fees.length === 0 ? (
        <Card padding="lg" className="text-center mb-6">
          <p className="font-semibold text-[var(--color-text)]">Aucun frais enregistré</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {canRecord ? 'Créez un type de frais : il sera affecté à tous les élèves actifs.' : 'Aucun frais n’est encore rattaché à vos enfants.'}
          </p>
        </Card>
      ) : (
        <DataTable
          data={fees}
          keyField="id"
          searchPlaceholder="Chercher un élève…"
          emptyMessage="Aucun frais"
          columns={[
            {
              key: 'student',
              header: 'Élève',
              render: (f: StudentFeeRow) => (
                <div className="flex items-center gap-2">
                  <Avatar name={`${f.students?.first_name ?? ''} ${f.students?.last_name ?? ''}`} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{f.students?.first_name} {f.students?.last_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{f.students?.classes?.name ?? '—'}</p>
                  </div>
                </div>
              ),
            },
            { key: 'fee', header: 'Type de frais', render: (f: StudentFeeRow) => f.fee_types?.name ?? '—' },
            { key: 'due', header: 'Montant dû', align: 'right', render: (f: StudentFeeRow) => formatCurrency(Number(f.amount_due)) },
            { key: 'paid', header: 'Payé', align: 'right', render: (f: StudentFeeRow) => <span className="font-medium text-green-600">{formatCurrency(Number(f.amount_paid))}</span> },
            {
              key: 'balance',
              header: 'Solde',
              align: 'right',
              render: (f: StudentFeeRow) => {
                const balance = Number(f.amount_due) - Number(f.amount_paid)
                return <span className={balance > 0 ? 'font-medium text-red-600' : 'text-green-600'}>{formatCurrency(balance)}</span>
              },
            },
            { key: 'status', header: 'Statut', render: (f: StudentFeeRow) => <FeeBadge status={f.status} /> },
          ]}
          actions={canRecord ? (f: StudentFeeRow) => {
            const balance = Number(f.amount_due) - Number(f.amount_paid)
            return balance > 0 ? (
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" icon={<Banknote size={12} />} onClick={() => openPayment(f)}>Encaisser</Button>
              </div>
            ) : null
          } : undefined}
        />
      )}

      <div className="mt-8">
        <h3 className="font-semibold text-[var(--color-text)] mb-3">Paiements enregistrés</h3>
        <Card padding="none" className="overflow-x-auto">
          {payments.length === 0 ? (
            <p className="p-6 text-sm text-center text-[var(--color-text-muted)]">Aucun paiement enregistré.</p>
          ) : (
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>Reçu</th>
                  <th>Élève</th>
                  <th className="text-right">Montant</th>
                  <th>Mode</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="font-mono text-xs bg-[var(--color-ivory-dark)] px-2 py-0.5 rounded">{p.receipt_number}</span></td>
                    <td className="font-medium text-sm">{p.students?.first_name} {p.students?.last_name}</td>
                    <td className="text-right font-bold text-green-600">{formatCurrency(Number(p.amount))}</td>
                    <td className="text-sm">{methodLabel(p.method)}</td>
                    <td className="text-sm">{formatDate(p.payment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Encaissement */}
      <Modal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        title="Enregistrer un paiement"
        size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setPayTarget(null)}>Annuler</Button>
          <Button onClick={handlePayment} loading={saving} icon={<Banknote size={14} />}>Encaisser et imprimer le reçu</Button>
        </>}
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-[var(--color-ivory)] rounded-xl">
            <p className="text-sm font-semibold">{payTarget?.students?.first_name} {payTarget?.students?.last_name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{payTarget?.fee_types?.name}</p>
            <p className="text-sm mt-1">
              Solde : <strong className="text-red-600">{formatCurrency(Number(payTarget?.amount_due ?? 0) - Number(payTarget?.amount_paid ?? 0))}</strong>
            </p>
          </div>
          <Input label="Montant à encaisser (TND)" type="number" min="0.001" step="0.001" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required />
          <Select label="Mode de paiement" options={METHOD_OPTIONS} value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value as PaymentMethod }))} />
          <Input label="Notes (optionnel)" value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} placeholder="Paiement tranche 1…" />
          <p className="text-xs text-[var(--color-text-muted)]">Un paiement enregistré ne peut plus être modifié ni supprimé.</p>
        </div>
      </Modal>

      {/* Nouveau type de frais */}
      <Modal
        open={feeTypeOpen}
        onClose={() => setFeeTypeOpen(false)}
        title="Nouveau type de frais"
        size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setFeeTypeOpen(false)}>Annuler</Button>
          <Button onClick={submitFeeType} loading={saving}>Créer</Button>
        </>}
      >
        <div className="flex flex-col gap-4">
          <Input label="Nom" value={feeTypeForm.name} onChange={e => setFeeTypeForm(f => ({ ...f, name: e.target.value }))} placeholder="Frais de scolarité" required />
          <Input label="Montant (TND)" type="number" min="0" step="0.001" value={feeTypeForm.amount} onChange={e => setFeeTypeForm(f => ({ ...f, amount: e.target.value }))} required />
          <Input label="Date limite" type="date" value={feeTypeForm.due_date} onChange={e => setFeeTypeForm(f => ({ ...f, due_date: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={feeTypeForm.is_mandatory} onChange={e => setFeeTypeForm(f => ({ ...f, is_mandatory: e.target.checked }))} className="accent-[var(--color-forest)]" />
            Frais obligatoire
          </label>
        </div>
      </Modal>
    </PageWrapper>
  )
}
