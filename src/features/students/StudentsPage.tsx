import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import {
  listStudents,
  listClasses,
  findParentsByPhone,
  findStudentAccountByEmail,
  createStudent,
  updateStudent,
  deleteStudent,
  type StudentRow,
  type ClassRow,
  type ProfileSummary,
  type Gender,
  type Relationship,
  type StudentStatus,
  type StudentInput,
  type ParentLink,
} from '@/features/students/studentService'

const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
]

const STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'transfere', label: 'Transféré' },
]

const RELATIONSHIP_OPTIONS = [
  { value: 'mere', label: 'Mère' },
  { value: 'pere', label: 'Père' },
  { value: 'tuteur', label: 'Tuteur' },
  { value: 'autre', label: 'Autre' },
]

interface FormState {
  first_name: string
  last_name: string
  birth_date: string
  gender: Gender
  classe_id: string
  status: StudentStatus
  parent_phone: string
  relationship: Relationship
  student_email: string
}

const EMPTY_FORM: FormState = {
  first_name: '',
  last_name: '',
  birth_date: '',
  gender: 'M',
  classe_id: '',
  status: 'actif',
  parent_phone: '',
  relationship: 'mere',
  student_email: '',
}

function errorMessage(err: unknown): string {
  return (err as { message?: string })?.message ?? 'Erreur inconnue'
}

export default function StudentsPage() {
  const { toast } = useToast()

  const [students, setStudents] = useState<StudentRow[]>([])
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClass, setFilterClass] = useState('')

  const [addOpen, setAddOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<StudentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [parentResults, setParentResults] = useState<ProfileSummary[]>([])
  const [selectedParent, setSelectedParent] = useState<ProfileSummary | null>(null)
  const [studentAccount, setStudentAccount] = useState<ProfileSummary | null>(null)

  const modalOpen = addOpen || editStudent !== null
  const classOptions = classes.map(c => ({ value: c.id, label: c.name }))
  const classFilterOptions = [{ value: '', label: 'Toutes les classes' }, ...classOptions]
  const filtered = filterClass
    ? students.filter(s => s.classe_id === filterClass)
    : students

  async function load() {
    setLoading(true)
    try {
      const [s, c] = await Promise.all([listStudents(), listClasses()])
      setStudents(s)
      setClasses(c)
    } catch (err) {
      toast({ type: 'error', title: 'Chargement impossible', message: errorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function closeModal() {
    setAddOpen(false)
    setEditStudent(null)
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setSelectedParent(null)
    setStudentAccount(null)
    setParentResults([])
    setAddOpen(true)
  }

  function openEdit(s: StudentRow) {
    const primary = s.parents[0]
    setForm({
      first_name: s.first_name,
      last_name: s.last_name,
      birth_date: s.birth_date,
      gender: s.gender,
      classe_id: s.classe_id ?? '',
      status: s.status,
      parent_phone: primary?.profiles.phone ?? '',
      relationship: primary?.relationship ?? 'mere',
      student_email: s.student_profile?.email ?? '',
    })
    setSelectedParent(primary?.profiles ?? null)
    setStudentAccount(s.student_profile)
    setParentResults([])
    setEditStudent(s)
  }

  async function searchParent() {
    setSearching(true)
    try {
      const results = await findParentsByPhone(form.parent_phone)
      setParentResults(results)
      if (results.length === 0) {
        toast({
          type: 'info',
          title: 'Aucun parent trouvé',
          message: 'Le parent doit d’abord créer son compte sur la plateforme.',
        })
      }
    } catch (err) {
      toast({ type: 'error', title: 'Recherche impossible', message: errorMessage(err) })
    } finally {
      setSearching(false)
    }
  }

  function pickParent(parent: ProfileSummary) {
    setSelectedParent(parent)
    setParentResults([])
    setForm(f => ({ ...f, parent_phone: parent.phone ?? f.parent_phone }))
  }

  async function checkStudentAccount() {
    const email = form.student_email.trim()
    if (!email) {
      setStudentAccount(null)
      return
    }
    try {
      const account = await findStudentAccountByEmail(email)
      setStudentAccount(account)
      if (!account) {
        toast({
          type: 'error',
          title: 'Compte introuvable',
          message: 'Aucun compte élève ne correspond à cette adresse e-mail.',
        })
      }
    } catch (err) {
      toast({ type: 'error', title: 'Vérification impossible', message: errorMessage(err) })
    }
  }

  async function handleSave() {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.birth_date) {
      toast({
        type: 'error',
        title: 'Champs obligatoires',
        message: 'Prénom, nom et date de naissance sont requis.',
      })
      return
    }
    if (!selectedParent) {
      toast({
        type: 'error',
        title: 'Parent manquant',
        message: 'Recherchez le parent par téléphone et sélectionnez-le.',
      })
      return
    }
    if (form.student_email.trim() && !studentAccount) {
      toast({
        type: 'error',
        title: 'Compte élève non vérifié',
        message: 'Vérifiez le compte élève ou videz le champ e-mail.',
      })
      return
    }

    const input: StudentInput = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      birth_date: form.birth_date,
      gender: form.gender,
      classe_id: form.classe_id || null,
      status: form.status,
      profile_id: studentAccount?.id ?? null,
    }
    const link: ParentLink = {
      profileId: selectedParent.id,
      relationship: form.relationship,
    }

    setSaving(true)
    try {
      if (editStudent) {
        await updateStudent(editStudent.id, input, link)
        toast({ type: 'success', title: 'Élève mis à jour', message: `${input.first_name} ${input.last_name} a été modifié.` })
      } else {
        await createStudent(input, link)
        toast({ type: 'success', title: 'Élève inscrit', message: `${input.first_name} ${input.last_name} est rattaché à ${selectedParent.full_name}.` })
      }
      closeModal()
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Enregistrement impossible', message: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteStudent(deleteTarget.id)
      toast({ type: 'success', title: 'Élève supprimé', message: `${deleteTarget.first_name} ${deleteTarget.last_name} a été retiré.` })
      setDeleteTarget(null)
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Suppression impossible', message: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const formBody = (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Informations de l’élève
        </p>
        <Input label="Prénom" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required placeholder="Prénom" />
        <Input label="Nom de famille" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required placeholder="Nom" />
        <Input label="Date de naissance" type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} required />
        <Select label="Sexe" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))} options={GENDER_OPTIONS} />
        <Select label="Classe" value={form.classe_id} onChange={e => setForm(f => ({ ...f, classe_id: e.target.value }))} options={classOptions} placeholder="Choisir une classe" />
        <Select label="Statut" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as StudentStatus }))} options={STATUS_OPTIONS} />
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Parent (déjà inscrit sur la plateforme)
        </p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input label="Téléphone du parent" type="tel" value={form.parent_phone} onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))} placeholder="+216 00 000 000" />
          </div>
          <Button variant="secondary" icon={<Search size={14} />} onClick={searchParent} loading={searching}>
            Rechercher
          </Button>
        </div>

        {parentResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {parentResults.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickParent(p)}
                className="text-left px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-ivory)] transition-colors"
              >
                <p className="text-sm font-semibold">{p.full_name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{p.email} • {p.phone}</p>
              </button>
            ))}
          </div>
        )}

        {selectedParent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--color-sage-light)]">
            <div className="sm:col-span-2 flex items-center gap-3">
              <Avatar name={selectedParent.full_name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{selectedParent.full_name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{selectedParent.email} • {selectedParent.phone}</p>
              </div>
            </div>
            <Select label="Lien avec l’élève" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value as Relationship }))} options={RELATIONSHIP_OPTIONS} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Compte de l’élève (optionnel)
        </p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input label="E-mail du compte élève" type="email" value={form.student_email} onChange={e => { setForm(f => ({ ...f, student_email: e.target.value })); setStudentAccount(null) }} placeholder="eleve@exemple.com" />
          </div>
          <Button variant="secondary" onClick={checkStudentAccount}>Vérifier</Button>
        </div>
        {studentAccount && (
          <p className="text-xs text-[var(--color-forest)]">Compte lié : {studentAccount.full_name}</p>
        )}
      </section>
    </div>
  )

  return (
    <PageWrapper
      title="Gestion des élèves"
      subtitle={loading ? 'Chargement…' : `${filtered.length} élève${filtered.length > 1 ? 's' : ''} inscrit${filtered.length > 1 ? 's' : ''}`}
      actions={
        <div className="flex items-center gap-2">
          <Select options={classFilterOptions} value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-40" />
          <Button icon={<Plus size={16} />} onClick={openAdd}>Inscrire un élève</Button>
        </div>
      }
    >
      <DataTable
        data={filtered}
        keyField="id"
        searchPlaceholder="Chercher un élève…"
        emptyMessage={loading ? 'Chargement…' : 'Aucun élève enregistré'}
        columns={[
          {
            key: 'last_name',
            header: 'Élève',
            sortable: true,
            render: (s: StudentRow) => (
              <div className="flex items-center gap-3">
                <Avatar name={`${s.first_name} ${s.last_name}`} size="sm" />
                <div>
                  <p className="font-medium text-[var(--color-text)]">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{s.student_number}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'classe',
            header: 'Classe',
            render: (s: StudentRow) => s.classes?.name ?? <span className="text-[var(--color-text-muted)]">—</span>,
          },
          {
            key: 'parent',
            header: 'Parent',
            render: (s: StudentRow) => {
              const p = s.parents[0]?.profiles
              return p ? (
                <div>
                  <p className="text-sm">{p.full_name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{p.phone}</p>
                </div>
              ) : <span className="text-[var(--color-text-muted)]">—</span>
            },
          },
          {
            key: 'account',
            header: 'Espace élève',
            render: (s: StudentRow) => s.student_profile
              ? <Badge variant="green" size="sm">Lié</Badge>
              : <Badge variant="gray" size="sm">Non lié</Badge>,
          },
          {
            key: 'birth_date',
            header: 'Naissance',
            render: (s: StudentRow) => formatDate(s.birth_date),
          },
          {
            key: 'status',
            header: 'Statut',
            render: (s: StudentRow) => (
              <Badge variant={s.status === 'actif' ? 'green' : s.status === 'inactif' ? 'gray' : 'yellow'} dot>
                {s.status}
              </Badge>
            ),
          },
        ]}
        actions={(s: StudentRow) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-[var(--color-ivory-dark)] text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors" title="Modifier">
              <Pencil size={14} />
            </button>
            <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors" title="Supprimer">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editStudent ? 'Modifier l’élève' : 'Inscrire un nouvel élève'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button onClick={handleSave} loading={saving}>{editStudent ? 'Mettre à jour' : 'Enregistrer'}</Button>
          </>
        }
      >
        {formBody}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer l’élève"
        loading={saving}
        message={`Supprimer ${deleteTarget?.first_name ?? ''} ${deleteTarget?.last_name ?? ''} ? Le lien avec le parent sera également supprimé.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </PageWrapper>
  )
}
