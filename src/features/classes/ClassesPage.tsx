import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  listClasses, saveClass, deleteClass,
  listSubjects, saveSubject,
  listTeachers, findTeacherAccount, saveTeacher,
  listRooms, saveRoom, deleteRoom,
  describeAdminError, LEVEL_OPTIONS,
  type ClassRow, type SubjectRow, type TeacherRow, type RoomRow,
} from '@/features/classes/adminService'
import { formatDate } from '@/lib/utils'

type Tab = 'classes' | 'subjects' | 'teachers' | 'rooms'

const TAB_LABELS: Record<Tab, string> = {
  classes: 'Classes',
  subjects: 'Matières',
  teachers: 'Enseignants',
  rooms: 'Salles',
}

const EMPTY_CLASS = { name: '', level: '', teacher_id: '', room_id: '', capacity: '30' }
const EMPTY_SUBJECT = { name: '', code: '', coefficient: '1', color: '#244B3C' }
const EMPTY_TEACHER = { full_name: '', account_email: '', specialty: '', hire_date: '' }
const EMPTY_ROOM = { name: '', building: '', capacity: '30', equipment: '' }

export default function ClassesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const canManage = user?.role === 'admin'

  const [tab, setTab] = useState<Tab>('classes')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [classes, setClasses] = useState<ClassRow[]>([])
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [rooms, setRooms] = useState<RoomRow[]>([])

  // Formulaires : un état par onglet, le modal est ouvert si l'id est défini ou si `open` est vrai
  const [classModal, setClassModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [classForm, setClassForm] = useState(EMPTY_CLASS)
  const [subjectModal, setSubjectModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [subjectForm, setSubjectForm] = useState(EMPTY_SUBJECT)
  const [teacherModal, setTeacherModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [teacherForm, setTeacherForm] = useState(EMPTY_TEACHER)
  const [roomModal, setRoomModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'class' | 'room'; id: string; label: string } | null>(null)

  async function load() {
    try {
      const [c, s, t, r] = await Promise.all([listClasses(), listSubjects(), listTeachers(), listRooms()])
      setClasses(c); setSubjects(s); setTeachers(t); setRooms(r)
    } catch (err) {
      toast({ type: 'error', title: 'Chargement impossible', message: describeAdminError(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const teacherOpts = teachers.map(t => ({ value: t.id, label: t.full_name }))
  const roomOpts = rooms.map(r => ({ value: r.id, label: r.name }))
  const levelOpts = LEVEL_OPTIONS.map(l => ({ value: l, label: l }))

  // ─── Classes ───
  function openClass(c: ClassRow | null) {
    setClassForm(c
      ? { name: c.name, level: c.level, teacher_id: c.teacher_id ?? '', room_id: c.room_id ?? '', capacity: String(c.capacity) }
      : EMPTY_CLASS)
    setClassModal({ open: true, id: c?.id ?? null })
  }

  async function submitClass() {
    if (!classForm.name.trim() || !classForm.level) {
      toast({ type: 'error', title: 'Champs manquants', message: 'Nom et niveau sont requis.' }); return
    }
    setSaving(true)
    try {
      await saveClass({
        name: classForm.name.trim(),
        level: classForm.level,
        capacity: Number(classForm.capacity) || 30,
        teacher_id: classForm.teacher_id || null,
        room_id: classForm.room_id || null,
      }, classModal.id)
      toast({ type: 'success', title: 'Classe enregistrée' })
      setClassModal({ open: false, id: null })
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Enregistrement impossible', message: describeAdminError(err) })
    } finally { setSaving(false) }
  }

  // ─── Matières ───
  function openSubject(s: SubjectRow | null) {
    setSubjectForm(s
      ? { name: s.name, code: s.code, coefficient: String(s.coefficient), color: s.color }
      : EMPTY_SUBJECT)
    setSubjectModal({ open: true, id: s?.id ?? null })
  }

  async function submitSubject() {
    if (!subjectForm.name.trim() || !subjectForm.code.trim()) {
      toast({ type: 'error', title: 'Champs manquants', message: 'Nom et code sont requis.' }); return
    }
    setSaving(true)
    try {
      await saveSubject({
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim().toUpperCase(),
        coefficient: Number(subjectForm.coefficient) || 1,
        color: subjectForm.color,
      }, subjectModal.id)
      toast({ type: 'success', title: 'Matière enregistrée' })
      setSubjectModal({ open: false, id: null })
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Enregistrement impossible', message: describeAdminError(err) })
    } finally { setSaving(false) }
  }

  // ─── Enseignants ───
  function openTeacher(t: TeacherRow | null) {
    setTeacherForm(t
      ? { full_name: t.full_name, account_email: t.profiles?.email ?? '', specialty: t.specialty ?? '', hire_date: t.hire_date ?? '' }
      : EMPTY_TEACHER)
    setTeacherModal({ open: true, id: t?.id ?? null })
  }

  async function submitTeacher() {
    if (!teacherForm.full_name.trim()) {
      toast({ type: 'error', title: 'Nom requis' }); return
    }
    setSaving(true)
    try {
      // Le compte doit déjà exister avec le rôle « enseignant » (attribué dans Paramètres)
      let profileId: string | null = null
      if (teacherForm.account_email.trim()) {
        const account = await findTeacherAccount(teacherForm.account_email)
        if (!account) {
          toast({
            type: 'error',
            title: 'Compte enseignant introuvable',
            message: 'Créez le compte, puis attribuez-lui le rôle « Enseignant » dans Paramètres.',
          })
          setSaving(false)
          return
        }
        profileId = account.id
      }
      await saveTeacher({
        full_name: teacherForm.full_name.trim(),
        specialty: teacherForm.specialty.trim() || null,
        hire_date: teacherForm.hire_date || null,
        profile_id: profileId,
      }, teacherModal.id)
      toast({ type: 'success', title: 'Enseignant enregistré' })
      setTeacherModal({ open: false, id: null })
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Enregistrement impossible', message: describeAdminError(err) })
    } finally { setSaving(false) }
  }

  // ─── Salles ───
  function openRoom(r: RoomRow | null) {
    setRoomForm(r
      ? { name: r.name, building: r.building ?? '', capacity: String(r.capacity), equipment: r.equipment.join(', ') }
      : EMPTY_ROOM)
    setRoomModal({ open: true, id: r?.id ?? null })
  }

  async function submitRoom() {
    if (!roomForm.name.trim()) {
      toast({ type: 'error', title: 'Nom requis' }); return
    }
    setSaving(true)
    try {
      await saveRoom({
        name: roomForm.name.trim(),
        building: roomForm.building.trim() || null,
        capacity: Number(roomForm.capacity) || 30,
        equipment: roomForm.equipment.split(',').map(e => e.trim()).filter(Boolean),
      }, roomModal.id)
      toast({ type: 'success', title: 'Salle enregistrée' })
      setRoomModal({ open: false, id: null })
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Enregistrement impossible', message: describeAdminError(err) })
    } finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      if (deleteTarget.kind === 'class') await deleteClass(deleteTarget.id)
      else await deleteRoom(deleteTarget.id)
      toast({ type: 'success', title: 'Suppression effectuée' })
      setDeleteTarget(null)
      await load()
    } catch (err) {
      toast({ type: 'error', title: 'Suppression impossible', message: describeAdminError(err) })
    } finally { setSaving(false) }
  }

  if (loading) return <PageLoading message="Chargement…" />

  const tabs = Object.keys(TAB_LABELS) as Tab[]

  return (
    <PageWrapper
      title="Classes & Organisation"
      subtitle={canManage ? 'Gestion de l’école — réservée à la direction' : 'Consultation de l’organisation de l’école'}
    >
      <div className="mb-6 flex w-fit gap-1 rounded-xl bg-[var(--color-ivory-dark)] p-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-[var(--color-forest)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'classes' && (
        <DataTable
          data={classes}
          keyField="id"
          searchPlaceholder="Chercher une classe…"
          emptyMessage="Aucune classe"
          header={canManage ? <Button icon={<Plus size={16} />} onClick={() => openClass(null)}>Nouvelle classe</Button> : undefined}
          columns={[
            { key: 'name', header: 'Nom', sortable: true, render: (r: ClassRow) => <span className="font-semibold">{r.name}</span> },
            { key: 'level', header: 'Niveau', render: (r: ClassRow) => <Badge variant="sage" size="sm">{r.level}</Badge> },
            { key: 'teacher', header: 'Titulaire', render: (r: ClassRow) => r.teachers?.full_name ?? '—' },
            { key: 'room', header: 'Salle', render: (r: ClassRow) => r.rooms?.name ?? '—' },
            { key: 'count', header: 'Effectif', render: (r: ClassRow) => `${r.students.length} / ${r.capacity}` },
          ]}
          actions={canManage ? (c: ClassRow) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openClass(c)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"><Pencil size={14} /></button>
              <button onClick={() => setDeleteTarget({ kind: 'class', id: c.id, label: c.name })} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ) : undefined}
        />
      )}

      {tab === 'subjects' && (
        <DataTable
          data={subjects}
          keyField="id"
          searchPlaceholder="Chercher une matière…"
          emptyMessage="Aucune matière"
          header={canManage ? <Button icon={<Plus size={16} />} onClick={() => openSubject(null)}>Nouvelle matière</Button> : undefined}
          columns={[
            { key: 'color', header: '', width: '40px', render: (r: SubjectRow) => <span className="inline-block h-4 w-4 rounded-full" style={{ background: r.color }} /> },
            { key: 'name', header: 'Matière', sortable: true, render: (r: SubjectRow) => <span className="font-semibold">{r.name}</span> },
            { key: 'code', header: 'Code', render: (r: SubjectRow) => <Badge variant="gray" size="sm">{r.code}</Badge> },
            { key: 'coefficient', header: 'Coefficient', render: (r: SubjectRow) => `× ${r.coefficient}` },
          ]}
          actions={canManage ? (s: SubjectRow) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openSubject(s)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"><Pencil size={14} /></button>
            </div>
          ) : undefined}
        />
      )}

      {tab === 'teachers' && (
        <DataTable
          data={teachers}
          keyField="id"
          searchPlaceholder="Chercher un enseignant…"
          emptyMessage="Aucun enseignant"
          header={canManage ? <Button icon={<Plus size={16} />} onClick={() => openTeacher(null)}>Ajouter un enseignant</Button> : undefined}
          columns={[
            { key: 'full_name', header: 'Nom', sortable: true, render: (r: TeacherRow) => <span className="font-semibold">{r.full_name}</span> },
            { key: 'employee_number', header: 'N° Emp.', render: (r: TeacherRow) => <Badge variant="gray" size="sm">{r.employee_number}</Badge> },
            { key: 'specialty', header: 'Spécialité', render: (r: TeacherRow) => r.specialty ?? '—' },
            { key: 'account', header: 'Compte', render: (r: TeacherRow) => r.profiles
              ? <span className="text-xs">{r.profiles.email}</span>
              : <Badge variant="yellow" size="sm">Non relié</Badge> },
            { key: 'hire_date', header: 'Embauche', render: (r: TeacherRow) => r.hire_date ? formatDate(r.hire_date) : '—' },
          ]}
          actions={canManage ? (t: TeacherRow) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openTeacher(t)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"><Pencil size={14} /></button>
            </div>
          ) : undefined}
        />
      )}

      {tab === 'rooms' && (
        <DataTable
          data={rooms}
          keyField="id"
          searchPlaceholder="Chercher une salle…"
          emptyMessage="Aucune salle"
          header={canManage ? <Button icon={<Plus size={16} />} onClick={() => openRoom(null)}>Ajouter une salle</Button> : undefined}
          columns={[
            { key: 'name', header: 'Salle', sortable: true, render: (r: RoomRow) => <span className="font-semibold">{r.name}</span> },
            { key: 'building', header: 'Bâtiment', render: (r: RoomRow) => r.building ?? '—' },
            { key: 'capacity', header: 'Capacité', render: (r: RoomRow) => `${r.capacity} places` },
            { key: 'equipment', header: 'Équipements', render: (r: RoomRow) => r.equipment.length
              ? r.equipment.map(e => <Badge key={e} variant="gray" size="sm" className="mr-1">{e}</Badge>)
              : '—' },
          ]}
          actions={canManage ? (rm: RoomRow) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openRoom(rm)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"><Pencil size={14} /></button>
              <button onClick={() => setDeleteTarget({ kind: 'room', id: rm.id, label: rm.name })} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ) : undefined}
        />
      )}

      {/* Classe */}
      <Modal
        open={classModal.open}
        onClose={() => setClassModal({ open: false, id: null })}
        title={classModal.id ? 'Modifier la classe' : 'Nouvelle classe'}
        size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setClassModal({ open: false, id: null })}>Annuler</Button>
          <Button onClick={submitClass} loading={saving}>Enregistrer</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nom de la classe" value={classForm.name} onChange={e => setClassForm(f => ({ ...f, name: e.target.value }))} placeholder="1ère année B" required />
          <Select label="Niveau" value={classForm.level} onChange={e => setClassForm(f => ({ ...f, level: e.target.value }))} options={levelOpts} placeholder="Choisir" />
          <Select label="Enseignant titulaire" value={classForm.teacher_id} onChange={e => setClassForm(f => ({ ...f, teacher_id: e.target.value }))} options={teacherOpts} placeholder="Choisir" />
          <Select label="Salle" value={classForm.room_id} onChange={e => setClassForm(f => ({ ...f, room_id: e.target.value }))} options={roomOpts} placeholder="Choisir" />
          <Input label="Capacité" type="number" min="1" value={classForm.capacity} onChange={e => setClassForm(f => ({ ...f, capacity: e.target.value }))} />
        </div>
      </Modal>

      {/* Matière */}
      <Modal
        open={subjectModal.open}
        onClose={() => setSubjectModal({ open: false, id: null })}
        title={subjectModal.id ? 'Modifier la matière' : 'Nouvelle matière'}
        size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setSubjectModal({ open: false, id: null })}>Annuler</Button>
          <Button onClick={submitSubject} loading={saving}>Enregistrer</Button>
        </>}
      >
        <div className="flex flex-col gap-4">
          <Input label="Nom de la matière" value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))} placeholder="Mathématiques" required />
          <Input label="Code" value={subjectForm.code} onChange={e => setSubjectForm(f => ({ ...f, code: e.target.value }))} placeholder="MATH" />
          <Input label="Coefficient" type="number" min="1" max="5" value={subjectForm.coefficient} onChange={e => setSubjectForm(f => ({ ...f, coefficient: e.target.value }))} />
          <Input label="Couleur" type="color" value={subjectForm.color} onChange={e => setSubjectForm(f => ({ ...f, color: e.target.value }))} />
        </div>
      </Modal>

      {/* Enseignant */}
      <Modal
        open={teacherModal.open}
        onClose={() => setTeacherModal({ open: false, id: null })}
        title={teacherModal.id ? 'Modifier l’enseignant' : 'Ajouter un enseignant'}
        size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setTeacherModal({ open: false, id: null })}>Annuler</Button>
          <Button onClick={submitTeacher} loading={saving}>Enregistrer</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nom complet" value={teacherForm.full_name} onChange={e => setTeacherForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nom Prénom" required />
          </div>
          <div className="col-span-2">
            <Input label="E-mail du compte enseignant" type="email" value={teacherForm.account_email} onChange={e => setTeacherForm(f => ({ ...f, account_email: e.target.value }))} placeholder="prenom.nom@exemple.com" hint="Le compte doit exister, avec le rôle « Enseignant » attribué dans Paramètres." />
          </div>
          <Input label="Spécialité" value={teacherForm.specialty} onChange={e => setTeacherForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Mathématiques" />
          <Input label="Date d’embauche" type="date" value={teacherForm.hire_date} onChange={e => setTeacherForm(f => ({ ...f, hire_date: e.target.value }))} />
        </div>
      </Modal>

      {/* Salle */}
      <Modal
        open={roomModal.open}
        onClose={() => setRoomModal({ open: false, id: null })}
        title={roomModal.id ? 'Modifier la salle' : 'Ajouter une salle'}
        size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setRoomModal({ open: false, id: null })}>Annuler</Button>
          <Button onClick={submitRoom} loading={saving}>Enregistrer</Button>
        </>}
      >
        <div className="flex flex-col gap-4">
          <Input label="Nom de la salle" value={roomForm.name} onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))} placeholder="Salle A101" required />
          <Input label="Bâtiment" value={roomForm.building} onChange={e => setRoomForm(f => ({ ...f, building: e.target.value }))} placeholder="Bloc A" />
          <Input label="Capacité" type="number" min="1" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))} />
          <Input label="Équipements" value={roomForm.equipment} onChange={e => setRoomForm(f => ({ ...f, equipment: e.target.value }))} placeholder="tableau, projecteur" hint="Séparés par des virgules." />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.kind === 'class' ? 'Supprimer la classe' : 'Supprimer la salle'}
        message={`Supprimer « ${deleteTarget?.label ?? ''} » ? Les cours et données liés peuvent empêcher la suppression.`}
        confirmLabel="Supprimer"
        loading={saving}
      />
    </PageWrapper>
  )
}
