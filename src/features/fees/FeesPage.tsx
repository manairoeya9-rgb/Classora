import { useState } from 'react'
import { CreditCard, Banknote, Smartphone, FileCheck } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { DataTable } from '@/components/ui/DataTable'
import { Card, StatCard } from '@/components/ui/Card'
import { FeeBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { DEMO_STUDENT_FEES } from '@/lib/demo-data'
import type { StudentFee, Payment } from '@/types'

const METHOD_OPTS = [
  { value: 'especes', label: 'Espèces' },
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cheque', label: 'Chèque' },
]

const METHOD_ICONS: Record<string, React.ReactNode> = {
  especes: <Banknote size={14} />,
  virement: <CreditCard size={14} />,
  mobile_money: <Smartphone size={14} />,
  cheque: <FileCheck size={14} />,
}

export default function FeesPage() {
  const { toast } = useToast()
  const [fees, setFees] = useState(DEMO_STUDENT_FEES)
  const [payments, setPayments] = useState<Payment[]>([])
  const [payOpen, setPayOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    method: 'especes',
    notes: '',
  })

  const totalDue = fees.reduce((s, f) => s + f.amount_due, 0)
  const totalPaid = fees.reduce((s, f) => s + f.amount_paid, 0)
  const outstanding = totalDue - totalPaid

  function openPay(fee: StudentFee) {
    setSelectedFee(fee)
    setForm({
      amount: String(fee.amount_due - fee.amount_paid),
      method: 'especes',
      notes: '',
    })
    setPayOpen(true)
  }

  async function handlePayment() {
    if (!selectedFee || !form.amount || +form.amount <= 0) {
      toast({ type: 'error', title: 'Montant invalide' })
      return
    }

    setSaving(true)
    await new Promise(r => setTimeout(r, 600))

    const amount = Math.min(
      +form.amount,
      selectedFee.amount_due - selectedFee.amount_paid
    )

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      student_fee_id: selectedFee.id,
      student_id: selectedFee.student_id,
      amount,
      payment_date: new Date().toISOString().split('T')[0],
      method: form.method as Payment['method'],
      receipt_number: receiptNumber,
      recorded_by: 'user-secretariat',
      notes: form.notes || undefined,
      student: selectedFee.student,
    }

    setPayments(ps => [...ps, newPayment])

    setFees(fs =>
      fs.map(f => {
        if (f.id !== selectedFee.id) return f

        const newPaid = f.amount_paid + amount
        const status: StudentFee['status'] =
          newPaid >= f.amount_due
            ? 'paye'
            : newPaid > 0
              ? 'partiel'
              : 'impaye'

        return {
          ...f,
          amount_paid: newPaid,
          status,
        }
      })
    )

    // Génération du reçu PDF
    setTimeout(async () => {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ format: 'a5' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('CLASSORA — REÇU DE PAIEMENT', 74, 20, {
        align: 'center',
      })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      doc.text(`N° Reçu : ${receiptNumber}`, 20, 35)
      doc.text(`Date : ${formatDate(new Date().toISOString())}`, 20, 42)
      doc.text(`Élève : ${selectedFee.student?.full_name}`, 20, 52)
      doc.text(`Type de frais : ${selectedFee.fee_type?.name}`, 20, 59)
      doc.text(`Montant payé : ${formatCurrency(amount)}`, 20, 66)
      doc.text(
        `Mode de paiement : ${METHOD_OPTS.find(m => m.value === form.method)?.label}`,
        20,
        73
      )
      doc.text(
        `Solde restant : ${formatCurrency(
          selectedFee.amount_due - selectedFee.amount_paid - amount
        )}`,
        20,
        80
      )

      doc.setFont('helvetica', 'bold')
      doc.text(
        'Merci de votre paiement — Classora École Primaire',
        74,
        100,
        { align: 'center' }
      )

      doc.save(`recu-${receiptNumber}.pdf`)
    }, 300)

    toast({
      type: 'success',
      title: 'Paiement enregistré',
      message: `Reçu ${receiptNumber} généré et téléchargé.`,
    })

    setPayOpen(false)
    setSaving(false)
  }

  return (
    <PageWrapper
      title="Frais de Scolarité"
      subtitle="Gestion des paiements et soldes"
    >
      {/* Statistiques financières */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total attendu"
          value={formatCurrency(totalDue)}
          icon={<CreditCard size={18} />}
          color="forest"
        />

        <StatCard
          title="Total collecté"
          value={formatCurrency(totalPaid)}
          icon={<Banknote size={18} />}
          color="sage"
        />

        <StatCard
          title="Solde impayé"
          value={formatCurrency(outstanding)}
          icon={<FileCheck size={18} />}
          color="coral"
        />
      </div>

      {/* Tableau des frais */}
      <DataTable
        data={fees}
        keyField="id"
        searchPlaceholder="Chercher un élève…"
        emptyMessage="Aucun frais"
        columns={[
          {
            key: 'student',
            header: 'Élève',
            render: row => {
              const f = row
              return (
                <div className="flex items-center gap-2">
                  <Avatar name={f.student?.full_name ?? ''} size="sm" />
                  <span className="font-medium text-sm">
                    {f.student?.full_name}
                  </span>
                </div>
              )
            },
          },
          {
            key: 'fee_type',
            header: 'Type de frais',
            render: row => row.fee_type?.name ?? '—',
          },
          {
            key: 'amount_due',
            header: 'Montant dû',
            render: row => formatCurrency(row.amount_due),
            align: 'right',
          },
          {
            key: 'amount_paid',
            header: 'Payé',
            render: row => (
              <span className="font-medium text-green-600">
                {formatCurrency(row.amount_paid)}
              </span>
            ),
            align: 'right',
          },
          {
            key: 'balance',
            header: 'Solde',
            render: row => {
              const balance = row.amount_due - row.amount_paid

              return (
                <span
                  className={
                    balance > 0
                      ? 'font-medium text-red-600'
                      : 'text-green-600'
                  }
                >
                  {formatCurrency(balance)}
                </span>
              )
            },
            align: 'right',
          },
          {
            key: 'status',
            header: 'Statut',
            render: row => <FeeBadge status={row.status} />,
          },
        ]}
        actions={row => {
          const balance = row.amount_due - row.amount_paid

          return (
            <div className="flex justify-end gap-1">
              {balance > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openPay(row)}
                  icon={<Banknote size={12} />}
                >
                  Encaisser
                </Button>
              )}
            </div>
          )
        }}
      />

      {/* Historique des paiements */}
      {payments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">
            Paiements enregistrés aujourd'hui
          </h3>

          <Card padding="none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reçu</th>
                  <th>Élève</th>
                  <th>Montant</th>
                  <th>Mode</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className="font-mono text-xs bg-[var(--color-ivory-dark)] px-2 py-0.5 rounded">
                        {p.receipt_number}
                      </span>
                    </td>

                    <td className="font-medium text-sm">
                      {p.student?.full_name}
                    </td>

                    <td className="font-bold text-green-600">
                      {formatCurrency(p.amount)}
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 text-sm">
                        {METHOD_ICONS[p.method]}
                        {METHOD_OPTS.find(m => m.value === p.method)?.label}
                      </div>
                    </td>

                    <td className="text-sm">{formatDate(p.payment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Fenêtre d'enregistrement d'un paiement */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Enregistrer un paiement"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>
              Annuler
            </Button>

            <Button
              onClick={handlePayment}
              loading={saving}
              icon={<Banknote size={14} />}
            >
              Encaisser + Reçu PDF
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-[var(--color-ivory)] rounded-xl">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {selectedFee?.student?.full_name}
            </p>

            <p className="text-xs text-[var(--color-text-muted)]">
              {selectedFee?.fee_type?.name}
            </p>

            <p className="text-sm mt-1">
              Solde :
              <strong className="text-red-600">
                {formatCurrency(
                  (selectedFee?.amount_due ?? 0) -
                    (selectedFee?.amount_paid ?? 0)
                )}
              </strong>
            </p>
          </div>

          <Input
            label="Montant à encaisser (DT)"
            type="number"
            min="1"
            value={form.amount}
            onChange={e =>
              setForm(f => ({ ...f, amount: e.target.value }))
            }
            required
          />

          <Select
            label="Mode de paiement"
            options={METHOD_OPTS}
            value={form.method}
            onChange={e =>
              setForm(f => ({ ...f, method: e.target.value }))
            }
          />

          <Input
            label="Notes (optionnel)"
            value={form.notes}
            onChange={e =>
              setForm(f => ({ ...f, notes: e.target.value }))
            }
            placeholder="Paiement tranche 1…"
          />
        </div>
      </Modal>
    </PageWrapper>
  )
}