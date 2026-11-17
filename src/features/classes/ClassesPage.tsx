
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import {
  DEMO_CLASSES,
  DEMO_SUBJECTS,
  DEMO_TEACHERS,
  DEMO_ROOMS,
} from '@/lib/demo-data'
import type { Classe, Subject, Teacher, Room } from '@/types'

type Tab = 'classes' | 'subjects' | 'teachers' | 'rooms'

const TAB_LABELS: Record<Tab, string> = {
  classes: 'Classes',
  subjects: 'Matières',
  teachers: 'Enseignants',
  rooms: 'Salles',
}

export default function ClassesPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('classes')

  // Classes
  const [classes, setClasses] = useState(DEMO_CLASSES)
  const [editClass, setEditClass] = useState<Classe | null>(null)
  const [deleteClass, setDeleteClass] = useState<Classe | null>(null)
  const [addClassOpen, setAddClassOpen] = useState(false)
  const [classForm, setClassForm] = useState({
    name: '',
    level: '',
    teacher_id: '',
    room_id: '',
    capacity: '30',
  })
  const [saving, setSaving] = useState(false)

  const LEVEL_OPTS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].map(v => ({
    value: v,
    label: v,
  }))

  const TEACHER_OPTS = DEMO_TEACHERS.map(t => ({
    value: t.id,
    label: t.full_name,
  }))

  const ROOM_OPTS = DEMO_ROOMS.map(r => ({
    value: r.id,
    label: r.name,
  }))

  async function saveClass() {
    setSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editClass) {
        setClasses(current =>
          current.map(c =>
            c.id === editClass.id
              ? {
                  ...c,
                  ...classForm,
                  capacity: Number(classForm.capacity),
                  teacher: DEMO_TEACHERS.find(
                    t => t.id === classForm.teacher_id,
                  ),
                  room: DEMO_ROOMS.find(
                    r => r.id === classForm.room_id,
                  ),
                }
              : c,
          ),
        )

        toast({ type: 'success', title: 'Classe mise à jour' })
        setEditClass(null)
      } else {
        const newClass: Classe = {
          id: `class-${Date.now()}`,
          academic_year_id: 'ay-2025-2026',
          ...classForm,
          capacity: Number(classForm.capacity),
          teacher: DEMO_TEACHERS.find(
            t => t.id === classForm.teacher_id,
          ),
          room: DEMO_ROOMS.find(
            r => r.id === classForm.room_id,
          ),
        }

        setClasses(current => [...current, newClass])
        toast({ type: 'success', title: 'Classe créée' })
        setAddClassOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  // Matières
  const [subjects, setSubjects] = useState(DEMO_SUBJECTS)
  const [editSubject, setEditSubject] = useState<Subject | null>(null)
  const [addSubjectOpen, setAddSubjectOpen] = useState(false)
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    coefficient: '1',
    color: '#244B3C',
  })

  async function saveSubject() {
    setSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editSubject) {
        setSubjects(current =>
          current.map(s =>
            s.id === editSubject.id
              ? {
                  ...s,
                  ...subjectForm,
                  coefficient: Number(subjectForm.coefficient),
                }
              : s,
          ),
        )

        toast({ type: 'success', title: 'Matière mise à jour' })
        setEditSubject(null)
      } else {
        setSubjects(current => [
          ...current,
          {
            id: `sub-${Date.now()}`,
            ...subjectForm,
            coefficient: Number(subjectForm.coefficient),
          },
        ])

        toast({ type: 'success', title: 'Matière créée' })
        setAddSubjectOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  // Enseignants
  const [teachers, setTeachers] = useState(DEMO_TEACHERS)
  const [addTeacherOpen, setAddTeacherOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [teacherForm, setTeacherForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
    hire_date: '',
  })

  async function saveTeacher() {
    setSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editTeacher) {
        setTeachers(current =>
          current.map(t =>
            t.id === editTeacher.id
              ? { ...t, ...teacherForm }
              : t,
          ),
        )

        toast({ type: 'success', title: 'Enseignant mis à jour' })
        setEditTeacher(null)
      } else {
        setTeachers(current => [
          ...current,
          {
            id: `teacher-${Date.now()}`,
            profile_id: '',
            employee_number: `ENS-${String(current.length + 1).padStart(3, '0')}`,
            ...teacherForm,
          },
        ])

        toast({ type: 'success', title: 'Enseignant ajouté' })
        setAddTeacherOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  // Salles
  const [rooms, setRooms] = useState(DEMO_ROOMS)
  const [addRoomOpen, setAddRoomOpen] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState({
    name: '',
    capacity: '30',
    building: '',
  })

  async function saveRoom() {
    setSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editRoom) {
        setRooms(current =>
          current.map(r =>
            r.id === editRoom.id
              ? {
                  ...r,
                  ...roomForm,
                  capacity: Number(roomForm.capacity),
                }
              : r,
          ),
        )

        toast({ type: 'success', title: 'Salle mise à jour' })
        setEditRoom(null)
      } else {
        setRooms(current => [
          ...current,
          {
            id: `room-${Date.now()}`,
            ...roomForm,
            capacity: Number(roomForm.capacity),
          },
        ])

        toast({ type: 'success', title: 'Salle créée' })
        setAddRoomOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper
      title="Classes & Organisation"
      subtitle="Gérez les classes, matières, enseignants et salles"
    >
      {/* Navigation des onglets */}
      <div className="mb-6 flex w-fit gap-1 rounded-xl bg-[var(--color-ivory-dark)] p-1">
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white text-[var(--color-forest)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Onglet Classes */}
      {tab === 'classes' && (
        <DataTable
          data={classes}
          keyField="id"
          searchPlaceholder="Chercher une classe…"
          emptyMessage="Aucune classe"
          header={
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setClassForm({
                  name: '',
                  level: '',
                  teacher_id: '',
                  room_id: '',
                  capacity: '30',
                })
                setAddClassOpen(true)
              }}
            >
              Nouvelle classe
            </Button>
          }
          columns={[
            {
              key: 'name',
              header: 'Nom',
              sortable: true,
              render: r => (
                <span className="font-semibold">{r.name}</span>
              ),
            },
            {
              key: 'level',
              header: 'Niveau',
              render: r => (
                <Badge variant="sage" size="sm">
                  {r.level}
                </Badge>
              ),
            },
            {
              key: 'teacher',
              header: 'Titulaire',
              render: r => r.teacher?.full_name ?? '—',
            },
            {
              key: 'room',
              header: 'Salle',
              render: r => r.room?.name ?? '—',
            },
            {
              key: 'capacity',
              header: 'Capacité',
              render: r => `${r.student_count ?? 0} / ${r.capacity}`,
            },
          ]}
          actions={c => (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => {
                  setClassForm({
                    name: c.name,
                    level: c.level,
                    teacher_id: c.teacher_id ?? '',
                    room_id: c.room_id ?? '',
                    capacity: String(c.capacity),
                  })
                  setEditClass(c)
                }}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteClass(c)}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Onglet Matières */}
      {tab === 'subjects' && (
        <DataTable
          data={subjects}
          keyField="id"
          searchPlaceholder="Chercher une matière…"
          emptyMessage="Aucune matière"
          header={
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setSubjectForm({
                  name: '',
                  code: '',
                  coefficient: '1',
                  color: '#244B3C',
                })
                setAddSubjectOpen(true)
              }}
            >
              Nouvelle matière
            </Button>
          }
          columns={[
            {
              key: 'color',
              header: '',
              width: '40px',
              render: r => (
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{ background: r.color }}
                />
              ),
            },
            {
              key: 'name',
              header: 'Matière',
              sortable: true,
              render: r => (
                <span className="font-semibold">{r.name}</span>
              ),
            },
            {
              key: 'code',
              header: 'Code',
              render: r => (
                <Badge variant="gray" size="sm">
                  {r.code}
                </Badge>
              ),
            },
            {
              key: 'coefficient',
              header: 'Coefficient',
              render: r => `× ${r.coefficient}`,
            },
          ]}
          actions={s => (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => {
                  setSubjectForm({
                    name: s.name,
                    code: s.code,
                    coefficient: String(s.coefficient),
                    color: s.color,
                  })
                  setEditSubject(s)
                }}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Onglet Enseignants */}
      {tab === 'teachers' && (
        <DataTable
          data={teachers}
          keyField="id"
          searchPlaceholder="Chercher un enseignant…"
          emptyMessage="Aucun enseignant"
          header={
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setTeacherForm({
                  full_name: '',
                  email: '',
                  phone: '',
                  specialty: '',
                  hire_date: '',
                })
                setAddTeacherOpen(true)
              }}
            >
              Ajouter un enseignant
            </Button>
          }
          columns={[
            {
              key: 'full_name',
              header: 'Nom',
              sortable: true,
              render: r => (
                <span className="font-semibold">{r.full_name}</span>
              ),
            },
            {
              key: 'employee_number',
              header: 'N° Emp.',
              render: r => (
                <Badge variant="gray" size="sm">
                  {r.employee_number}
                </Badge>
              ),
            },
            {
              key: 'specialty',
              header: 'Spécialité',
              sortable: true,
            },
            {
              key: 'email',
              header: 'Email',
              render: r => <span className="text-xs">{r.email}</span>,
            },
            { key: 'phone', header: 'Téléphone' },
          ]}
          actions={t => (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => {
                  setTeacherForm({
                    full_name: t.full_name,
                    email: t.email,
                    phone: t.phone ?? '',
                    specialty: t.specialty,
                    hire_date: t.hire_date,
                  })
                  setEditTeacher(t)
                }}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Onglet Salles */}
      {tab === 'rooms' && (
        <DataTable
          data={rooms}
          keyField="id"
          searchPlaceholder="Chercher une salle…"
          emptyMessage="Aucune salle"
          header={
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setRoomForm({
                  name: '',
                  capacity: '30',
                  building: '',
                })
                setAddRoomOpen(true)
              }}
            >
              Ajouter une salle
            </Button>
          }
          columns={[
            {
              key: 'name',
              header: 'Salle',
              sortable: true,
              render: r => (
                <span className="font-semibold">{r.name}</span>
              ),
            },
            { key: 'building', header: 'Bâtiment' },
            {
              key: 'capacity',
              header: 'Capacité',
              render: r => `${r.capacity} places`,
            },
            {
              key: 'equipment',
              header: 'Équipements',
              render: r =>
                r.equipment?.map(e => (
                  <Badge
                    key={e}
                    variant="gray"
                    size="sm"
                    className="mr-1"
                  >
                    {e}
                  </Badge>
                )) ?? '—',
            },
          ]}
          actions={rm => (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => {
                  setRoomForm({
                    name: rm.name,
                    capacity: String(rm.capacity),
                    building: rm.building ?? '',
                  })
                  setEditRoom(rm)
                }}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-ivory-dark)] hover:text-[var(--color-forest)]"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Modales Classes */}
      <Modal
        open={addClassOpen || !!editClass}
        onClose={() => {
          setAddClassOpen(false)
          setEditClass(null)
        }}
        title={editClass ? 'Modifier la classe' : 'Nouvelle classe'}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setAddClassOpen(false)
                setEditClass(null)
              }}
            >
              Annuler
            </Button>
            <Button onClick={saveClass} loading={saving}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom de la classe"
            value={classForm.name}
            onChange={e =>
              setClassForm(f => ({ ...f, name: e.target.value }))
            }
            placeholder="CE1 B"
            required
          />
          <Select
            label="Niveau"
            value={classForm.level}
            onChange={e =>
              setClassForm(f => ({ ...f, level: e.target.value }))
            }
            options={LEVEL_OPTS}
            placeholder="Choisir"
          />
          <Select
            label="Enseignant titulaire"
            value={classForm.teacher_id}
            onChange={e =>
              setClassForm(f => ({ ...f, teacher_id: e.target.value }))
            }
            options={TEACHER_OPTS}
            placeholder="Choisir"
          />
          <Select
            label="Salle"
            value={classForm.room_id}
            onChange={e =>
              setClassForm(f => ({ ...f, room_id: e.target.value }))
            }
            options={ROOM_OPTS}
            placeholder="Choisir"
          />
          <Input
            label="Capacité"
            type="number"
            value={classForm.capacity}
            onChange={e =>
              setClassForm(f => ({ ...f, capacity: e.target.value }))
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteClass}
        onClose={() => setDeleteClass(null)}
        onConfirm={() => {
          setClasses(current =>
            current.filter(c => c.id !== deleteClass?.id),
          )
          setDeleteClass(null)
          toast({ type: 'success', title: 'Classe supprimée' })
        }}
        title="Supprimer la classe"
        message={`Supprimer la classe ${deleteClass?.name} ?`}
        confirmLabel="Supprimer"
      />

      {/* Modales Matières */}
      <Modal
        open={addSubjectOpen || !!editSubject}
        onClose={() => {
          setAddSubjectOpen(false)
          setEditSubject(null)
        }}
        title={editSubject ? 'Modifier la matière' : 'Nouvelle matière'}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setAddSubjectOpen(false)
                setEditSubject(null)
              }}
            >
              Annuler
            </Button>
            <Button onClick={saveSubject} loading={saving}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nom de la matière"
            value={subjectForm.name}
            onChange={e =>
              setSubjectForm(f => ({ ...f, name: e.target.value }))
            }
            placeholder="Mathématiques"
            required
          />
          <Input
            label="Code"
            value={subjectForm.code}
            onChange={e =>
              setSubjectForm(f => ({ ...f, code: e.target.value }))
            }
            placeholder="MATH"
          />
          <Input
            label="Coefficient"
            type="number"
            min="1"
            max="5"
            value={subjectForm.coefficient}
            onChange={e =>
              setSubjectForm(f => ({
                ...f,
                coefficient: e.target.value,
              }))
            }
          />
          <Input
            label="Couleur"
            type="color"
            value={subjectForm.color}
            onChange={e =>
              setSubjectForm(f => ({ ...f, color: e.target.value }))
            }
          />
        </div>
      </Modal>

      {/* Modales Enseignants */}
      <Modal
        open={addTeacherOpen || !!editTeacher}
        onClose={() => {
          setAddTeacherOpen(false)
          setEditTeacher(null)
        }}
        title={
          editTeacher
            ? "Modifier l'enseignant"
            : 'Ajouter un enseignant'
        }
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setAddTeacherOpen(false)
                setEditTeacher(null)
              }}
            >
              Annuler
            </Button>
            <Button onClick={saveTeacher} loading={saving}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Nom complet"
              value={teacherForm.full_name}
              onChange={e =>
                setTeacherForm(f => ({
                  ...f,
                  full_name: e.target.value,
                }))
              }
              placeholder="M. Martin Dubois"
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={teacherForm.email}
            onChange={e =>
              setTeacherForm(f => ({ ...f, email: e.target.value }))
            }
            placeholder="martin.dubois@classora.fr"
          />
          <Input
            label="Téléphone"
            value={teacherForm.phone}
            onChange={e =>
              setTeacherForm(f => ({ ...f, phone: e.target.value }))
            }
            placeholder="+33 6 12 34 56 78"
          />
          <Input
            label="Spécialité"
            value={teacherForm.specialty}
            onChange={e =>
              setTeacherForm(f => ({
                ...f,
                specialty: e.target.value,
              }))
            }
            placeholder="Mathématiques"
          />
          <Input
            label="Date d'embauche"
            type="date"
            value={teacherForm.hire_date}
            onChange={e =>
              setTeacherForm(f => ({
                ...f,
                hire_date: e.target.value,
              }))
            }
          />
        </div>
      </Modal>

      {/* Modales Salles */}
      <Modal
        open={addRoomOpen || !!editRoom}
        onClose={() => {
          setAddRoomOpen(false)
          setEditRoom(null)
        }}
        title={editRoom ? 'Modifier la salle' : 'Ajouter une salle'}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setAddRoomOpen(false)
                setEditRoom(null)
              }}
            >
              Annuler
            </Button>
            <Button onClick={saveRoom} loading={saving}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nom de la salle"
            value={roomForm.name}
            onChange={e =>
              setRoomForm(f => ({ ...f, name: e.target.value }))
            }
            placeholder="Salle A101"
            required
          />
          <Input
            label="Bâtiment"
            value={roomForm.building}
            onChange={e =>
              setRoomForm(f => ({ ...f, building: e.target.value }))
            }
            placeholder="Bâtiment A"
          />
          <Input
            label="Capacité"
            type="number"
            value={roomForm.capacity}
            onChange={e =>
              setRoomForm(f => ({ ...f, capacity: e.target.value }))
            }
          />
        </div>
      </Modal>
    </PageWrapper>
  )
}
