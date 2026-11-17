
import type {
  Profile, Student, Teacher, Classe, Subject, Room, TimetableSlot,
  Grade, Attendance, FeeType, StudentFee, Payment, Homework,
  Message, Announcement, AcademicYear
} from '@/types'

// ⚠️ DONNÉES DE TEST UNIQUEMENT — toutes les personnes, adresses e-mail et
// numéros de téléphone ci-dessous sont fictifs (domaine réservé example.com,
// numéros 00 000 000 non attribués).

// ─── Année scolaire ──────────────────────────────────────────────────────────

export const DEMO_ACADEMIC_YEAR: AcademicYear = {
  id: 'ay-2026-2027',
  label: '2026-2027',
  start_date: '2026-09-15',
  end_date: '2027-06-30',
  is_current: true,
}

// ─── Profils ─────────────────────────────────────────────────────────────────

export const DEMO_PROFILES: Profile[] = [
  { id: 'user-admin', email: 'direction.test@example.com', full_name: 'Compte Test Direction', role: 'admin', phone: '+216 00 000 001', created_at: '2026-09-01' },
  { id: 'user-teacher-1', email: 'enseignant1.test@example.com', full_name: 'Enseignant Test 1', role: 'enseignant', phone: '+216 00 000 002', created_at: '2026-09-01' },
  { id: 'user-teacher-2', email: 'enseignant2.test@example.com', full_name: 'Enseignante Test 2', role: 'enseignant', phone: '+216 00 000 003', created_at: '2026-09-01' },
  { id: 'user-teacher-3', email: 'enseignant3.test@example.com', full_name: 'Enseignant Test 3', role: 'enseignant', phone: '+216 00 000 004', created_at: '2026-09-01' },
  { id: 'user-parent-1', email: 'parent1.test@example.com', full_name: 'Parent Test 1', role: 'parent', phone: '+216 00 000 005', created_at: '2026-09-01' },
  { id: 'user-parent-2', email: 'parent2.test@example.com', full_name: 'Parent Test 2', role: 'parent', phone: '+216 00 000 006', created_at: '2026-09-01' },
  { id: 'user-eleve-1', email: 'eleve1.test@example.com', full_name: 'Élève Test 1', role: 'eleve', created_at: '2026-09-01' },
  { id: 'user-secretariat', email: 'secretariat.test@example.com', full_name: 'Compte Test Secrétariat', role: 'secretariat', phone: '+216 00 000 007', created_at: '2026-09-01' },
]

// ─── Salles ──────────────────────────────────────────────────────────────────

export const DEMO_ROOMS: Room[] = [
  { id: 'room-1', name: 'Salle 1', capacity: 28, building: 'Bloc A', equipment: ['tableau', 'projecteur'] },
  { id: 'room-2', name: 'Salle 2', capacity: 28, building: 'Bloc A', equipment: ['tableau'] },
  { id: 'room-3', name: 'Salle 3', capacity: 30, building: 'Bloc A', equipment: ['tableau', 'projecteur'] },
  { id: 'room-4', name: 'Salle 4', capacity: 30, building: 'Bloc B', equipment: ['tableau'] },
  { id: 'room-5', name: 'Salle 5', capacity: 30, building: 'Bloc B', equipment: ['tableau', 'ordinateurs'] },
  { id: 'room-6', name: 'Salle polyvalente', capacity: 35, building: 'Bloc B', equipment: ['tables', 'projecteur'] },
]

// ─── Matières scolaires tunisiennes ──────────────────────────────────────────

export const DEMO_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Langue arabe', code: 'ARB', coefficient: 3, color: '#244B3C' },
  { id: 'sub-2', name: 'Mathématiques', code: 'MATH', coefficient: 3, color: '#DBEAFE' },
  { id: 'sub-3', name: 'Éveil scientifique', code: 'SCI', coefficient: 2, color: '#B8CDB8' },
  { id: 'sub-4', name: 'Éducation islamique', code: 'ISL', coefficient: 1, color: '#D8D0F0' },
  { id: 'sub-5', name: 'Français', code: 'FR', coefficient: 2, color: '#F2A58F' },
  { id: 'sub-6', name: 'Anglais', code: 'ANG', coefficient: 2, color: '#DBEAFE' },
  { id: 'sub-7', name: 'Éducation physique', code: 'EPS', coefficient: 1, color: '#F3D78A' },
  { id: 'sub-8', name: 'Éducation artistique', code: 'ART', coefficient: 1, color: '#FAD4C8' },
  { id: 'sub-9', name: 'Éducation musicale', code: 'MUS', coefficient: 1, color: '#FEF9C3' },
  { id: 'sub-10', name: 'Histoire', code: 'HIST', coefficient: 1, color: '#E8D5B5' },
  { id: 'sub-11', name: 'Géographie', code: 'GEO', coefficient: 1, color: '#C7E8D5' },
  { id: 'sub-12', name: 'Éducation civique', code: 'CIV', coefficient: 1, color: '#F5D0D0' },
]

// ─── Enseignants ─────────────────────────────────────────────────────────────

export const DEMO_TEACHERS: Teacher[] = [
  { id: 'teacher-1', profile_id: 'user-teacher-1', employee_number: 'ENS-001', full_name: 'Enseignant Test 1', email: 'enseignant1.test@example.com', phone: '+216 00 000 002', specialty: 'Mathématiques', hire_date: '2018-09-01' },
  { id: 'teacher-2', profile_id: 'user-teacher-2', employee_number: 'ENS-002', full_name: 'Enseignante Test 2', email: 'enseignant2.test@example.com', phone: '+216 00 000 003', specialty: 'Langue arabe', hire_date: '2020-09-01' },
  { id: 'teacher-3', profile_id: 'user-teacher-3', employee_number: 'ENS-003', full_name: 'Enseignant Test 3', email: 'enseignant3.test@example.com', phone: '+216 00 000 004', specialty: 'Éveil scientifique', hire_date: '2019-09-01' },
  { id: 'teacher-4', profile_id: 'user-admin', employee_number: 'ENS-004', full_name: 'Enseignante Test 4', email: 'direction.test@example.com', phone: '+216 00 000 001', specialty: 'Français', hire_date: '2021-09-01' },
  { id: 'teacher-5', profile_id: 'user-admin', employee_number: 'ENS-005', full_name: 'Enseignant Test 5', email: 'direction.test@example.com', phone: '+216 00 000 001', specialty: 'Anglais', hire_date: '2022-09-01' },
]

// ─── Classes : 1ère à 6ème année ─────────────────────────────────────────────

export const DEMO_CLASSES: Classe[] = [
  { id: 'class-cp', name: '1ère année A', level: '1ère année', teacher_id: 'teacher-2', academic_year_id: 'ay-2026-2027', room_id: 'room-1', capacity: 28, teacher: DEMO_TEACHERS[1], room: DEMO_ROOMS[0], student_count: 24 },
  { id: 'class-ce1', name: '2ème année A', level: '2ème année', teacher_id: 'teacher-1', academic_year_id: 'ay-2026-2027', room_id: 'room-2', capacity: 28, teacher: DEMO_TEACHERS[0], room: DEMO_ROOMS[1], student_count: 26 },
  { id: 'class-ce2', name: '3ème année A', level: '3ème année', teacher_id: 'teacher-3', academic_year_id: 'ay-2026-2027', room_id: 'room-3', capacity: 30, teacher: DEMO_TEACHERS[2], room: DEMO_ROOMS[2], student_count: 27 },
  { id: 'class-cm1', name: '4ème année A', level: '4ème année', teacher_id: 'teacher-4', academic_year_id: 'ay-2026-2027', room_id: 'room-4', capacity: 30, teacher: DEMO_TEACHERS[3], room: DEMO_ROOMS[3], student_count: 25 },
  { id: 'class-cm2', name: '5ème année A', level: '5ème année', teacher_id: 'teacher-5', academic_year_id: 'ay-2026-2027', room_id: 'room-5', capacity: 30, teacher: DEMO_TEACHERS[4], room: DEMO_ROOMS[4], student_count: 23 },
  { id: 'class-6eme', name: '6ème année A', level: '6ème année', teacher_id: 'teacher-2', academic_year_id: 'ay-2026-2027', room_id: 'room-6', capacity: 30, teacher: DEMO_TEACHERS[1], room: DEMO_ROOMS[5], student_count: 22 },
]

// ─── Élèves (fictifs) ────────────────────────────────────────────────────────

export const DEMO_STUDENTS: Student[] = [
  { id: 'stu-1', student_number: 'EL-2026-001', first_name: 'Élève', last_name: 'Test 1', full_name: 'Élève Test 1', birth_date: '2020-03-14', gender: 'F', classe_id: 'class-cp', classe: DEMO_CLASSES[0], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
  { id: 'stu-2', student_number: 'EL-2026-002', first_name: 'Élève', last_name: 'Test 2', full_name: 'Élève Test 2', birth_date: '2019-07-22', gender: 'M', classe_id: 'class-ce1', classe: DEMO_CLASSES[1], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
  { id: 'stu-3', student_number: 'EL-2026-003', first_name: 'Élève', last_name: 'Test 3', full_name: 'Élève Test 3', birth_date: '2018-11-08', gender: 'F', classe_id: 'class-ce2', classe: DEMO_CLASSES[2], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
  { id: 'stu-4', student_number: 'EL-2026-004', first_name: 'Élève', last_name: 'Test 4', full_name: 'Élève Test 4', birth_date: '2017-05-30', gender: 'M', classe_id: 'class-cm1', classe: DEMO_CLASSES[3], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
  { id: 'stu-5', student_number: 'EL-2026-005', first_name: 'Élève', last_name: 'Test 5', full_name: 'Élève Test 5', birth_date: '2016-09-18', gender: 'F', classe_id: 'class-cm2', classe: DEMO_CLASSES[4], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
  { id: 'stu-6', student_number: 'EL-2026-006', first_name: 'Élève', last_name: 'Test 6', full_name: 'Élève Test 6', birth_date: '2020-01-25', gender: 'M', classe_id: 'class-cp', classe: DEMO_CLASSES[0], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
  { id: 'stu-7', student_number: 'EL-2026-007', first_name: 'Élève', last_name: 'Test 7', full_name: 'Élève Test 7', birth_date: '2019-04-12', gender: 'F', classe_id: 'class-ce1', classe: DEMO_CLASSES[1], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
  { id: 'stu-8', student_number: 'EL-2026-008', first_name: 'Élève', last_name: 'Test 8', full_name: 'Élève Test 8', birth_date: '2016-08-03', gender: 'M', classe_id: 'class-6eme', classe: DEMO_CLASSES[5], enrollment_date: '2026-09-15', academic_year_id: 'ay-2026-2027', status: 'actif' },
]

// ─── Notes ───────────────────────────────────────────────────────────────────

export const DEMO_GRADES: Grade[] = [
  { id: 'g-1', student_id: 'stu-1', subject_id: 'sub-1', classe_id: 'class-cp', academic_year_id: 'ay-2026-2027', trimester: 1, value: 16.5, max_value: 20, label: 'Lecture et compréhension', date: '2026-10-05', subject: DEMO_SUBJECTS[0] },
  { id: 'g-2', student_id: 'stu-1', subject_id: 'sub-2', classe_id: 'class-cp', academic_year_id: 'ay-2026-2027', trimester: 1, value: 14, max_value: 20, label: 'Calcul et numération', date: '2026-10-06', subject: DEMO_SUBJECTS[1] },
  { id: 'g-3', student_id: 'stu-1', subject_id: 'sub-3', classe_id: 'class-cp', academic_year_id: 'ay-2026-2027', trimester: 1, value: 18, max_value: 20, label: 'Éveil scientifique', date: '2026-10-08', subject: DEMO_SUBJECTS[2] },
  { id: 'g-4', student_id: 'stu-2', subject_id: 'sub-1', classe_id: 'class-ce1', academic_year_id: 'ay-2026-2027', trimester: 1, value: 13, max_value: 20, label: 'Lecture', date: '2026-10-05', subject: DEMO_SUBJECTS[0] },
  { id: 'g-5', student_id: 'stu-2', subject_id: 'sub-2', classe_id: 'class-ce1', academic_year_id: 'ay-2026-2027', trimester: 1, value: 15.5, max_value: 20, label: 'Problèmes mathématiques', date: '2026-10-07', subject: DEMO_SUBJECTS[1] },
  { id: 'g-6', student_id: 'stu-3', subject_id: 'sub-5', classe_id: 'class-ce2', academic_year_id: 'ay-2026-2027', trimester: 1, value: 11, max_value: 20, label: 'Compréhension française', date: '2026-10-05', subject: DEMO_SUBJECTS[4] },
]

// ─── Présences ───────────────────────────────────────────────────────────────

export const DEMO_ATTENDANCE: Attendance[] = [
  { id: 'att-1', student_id: 'stu-1', classe_id: 'class-cp', date: '2026-10-20', status: 'present', noted_by: 'teacher-2' },
  { id: 'att-2', student_id: 'stu-2', classe_id: 'class-ce1', date: '2026-10-20', status: 'absent', justification: 'Maladie', noted_by: 'teacher-1' },
  { id: 'att-3', student_id: 'stu-3', classe_id: 'class-ce2', date: '2026-10-20', status: 'present', noted_by: 'teacher-3' },
  { id: 'att-4', student_id: 'stu-4', classe_id: 'class-cm1', date: '2026-10-20', status: 'retard', noted_by: 'teacher-4' },
  { id: 'att-5', student_id: 'stu-8', classe_id: 'class-6eme', date: '2026-10-20', status: 'present', noted_by: 'teacher-2' },
]

// ─── Frais scolaires (montants en TND) ────────────────────────────────────────

export const DEMO_FEE_TYPES: FeeType[] = [
  { id: 'fee-1', name: 'Frais de scolarité', amount: 450, academic_year_id: 'ay-2026-2027', due_date: '2026-10-01', is_mandatory: true, description: 'Frais de scolarité pour l’année 2026-2027 (450 TND)' },
  { id: 'fee-2', name: 'Cantine scolaire', amount: 85, academic_year_id: 'ay-2026-2027', due_date: '2026-10-01', is_mandatory: false, description: 'Abonnement cantine (85 TND)' },
  { id: 'fee-3', name: 'Fournitures scolaires', amount: 35, academic_year_id: 'ay-2026-2027', due_date: '2026-09-15', is_mandatory: true, description: 'Fournitures scolaires (35 TND)' },
  { id: 'fee-4', name: 'Transport scolaire', amount: 60, academic_year_id: 'ay-2026-2027', due_date: '2026-10-01', is_mandatory: false, description: 'Transport scolaire (60 TND)' },
]

export const DEMO_STUDENT_FEES: StudentFee[] = [
  { id: 'sf-1', student_id: 'stu-1', fee_type_id: 'fee-1', amount_due: 450, amount_paid: 450, status: 'paye', academic_year_id: 'ay-2026-2027', student: DEMO_STUDENTS[0], fee_type: DEMO_FEE_TYPES[0] },
  { id: 'sf-2', student_id: 'stu-2', fee_type_id: 'fee-1', amount_due: 450, amount_paid: 225, status: 'partiel', academic_year_id: 'ay-2026-2027', student: DEMO_STUDENTS[1], fee_type: DEMO_FEE_TYPES[0] },
  { id: 'sf-3', student_id: 'stu-3', fee_type_id: 'fee-1', amount_due: 450, amount_paid: 0, status: 'impaye', academic_year_id: 'ay-2026-2027', student: DEMO_STUDENTS[2], fee_type: DEMO_FEE_TYPES[0] },
  { id: 'sf-4', student_id: 'stu-4', fee_type_id: 'fee-1', amount_due: 450, amount_paid: 450, status: 'paye', academic_year_id: 'ay-2026-2027', student: DEMO_STUDENTS[3], fee_type: DEMO_FEE_TYPES[0] },
]

// ─── Devoirs ─────────────────────────────────────────────────────────────────

export const DEMO_HOMEWORK: Homework[] = [
  { id: 'hw-1', title: 'Exercices de multiplication', description: 'Faire les exercices du manuel de mathématiques : tables de multiplication et problèmes.', subject_id: 'sub-2', classe_id: 'class-ce1', teacher_id: 'teacher-1', due_date: '2026-10-28', published_at: '2026-10-20', subject: DEMO_SUBJECTS[1], classe: DEMO_CLASSES[1], teacher: DEMO_TEACHERS[0] },
  { id: 'hw-2', title: 'Lecture et compréhension', description: 'Lire le texte étudié en classe et répondre aux questions de compréhension.', subject_id: 'sub-1', classe_id: 'class-ce2', teacher_id: 'teacher-2', due_date: '2026-10-29', published_at: '2026-10-20', subject: DEMO_SUBJECTS[0], classe: DEMO_CLASSES[2], teacher: DEMO_TEACHERS[1] },
  { id: 'hw-3', title: 'Leçon sur les êtres vivants', description: 'Réviser la leçon d’éveil scientifique et préparer les exercices.', subject_id: 'sub-3', classe_id: 'class-cm1', teacher_id: 'teacher-3', due_date: '2026-10-27', published_at: '2026-10-19', subject: DEMO_SUBJECTS[2], classe: DEMO_CLASSES[3], teacher: DEMO_TEACHERS[2] },
]

// ─── Messages ────────────────────────────────────────────────────────────────

export const DEMO_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender_id: 'user-parent-1',
    recipient_id: 'user-teacher-2',
    subject: 'Absence de Élève Test 1',
    body: 'Bonjour Enseignante Test 2,\n\nJe vous informe que mon enfant Élève Test 1 sera absent demain pour un rendez-vous médical.\n\nCordialement,\nParent Test 1',
    sent_at: '2026-10-21T08:30:00',
    is_archived: false,
    sender: DEMO_PROFILES[4],
    recipient: DEMO_PROFILES[2],
  },
  {
    id: 'msg-2',
    sender_id: 'user-teacher-1',
    recipient_id: 'user-parent-2',
    subject: 'Résultats scolaires de Élève Test 2',
    body: 'Bonjour Parent Test 2,\n\nÉlève Test 2 progresse bien en mathématiques. Il doit continuer ses efforts en lecture.\n\nCordialement,\nEnseignant Test 1',
    sent_at: '2026-10-20T14:15:00',
    read_at: '2026-10-20T18:30:00',
    is_archived: false,
    sender: DEMO_PROFILES[1],
    recipient: DEMO_PROFILES[5],
  },
]

// ─── Annonces ────────────────────────────────────────────────────────────────

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Réunion parents-professeurs',
    body: 'Chers parents, une réunion parents-professeurs est organisée le vendredi 13 novembre 2026 de 16h00 à 18h00. Nous comptons sur votre présence.',
    author_id: 'user-admin',
    target_roles: ['parent', 'enseignant'],
    published_at: '2026-10-18',
    is_pinned: true,
    author: DEMO_PROFILES[0],
  },
  {
    id: 'ann-2',
    title: 'Sortie pédagogique',
    body: 'Une sortie pédagogique sera organisée pour les élèves de 5ème et 6ème année. Les informations concernant le lieu et les horaires seront communiquées prochainement.',
    author_id: 'user-admin',
    target_roles: ['parent', 'eleve', 'enseignant'],
    published_at: '2026-10-15',
    is_pinned: false,
    author: DEMO_PROFILES[0],
  },
  {
    id: 'ann-3',
    title: 'Rappel : horaires scolaires',
    body: 'Les cours commencent à 08h00. Les récréations ont lieu à 10h00 et à 15h00 et durent chacune 10 minutes. La pause déjeuner est prévue de 12h00 à 14h00.',
    author_id: 'user-admin',
    target_roles: ['parent', 'eleve', 'enseignant', 'admin', 'secretariat'],
    published_at: '2026-10-10',
    is_pinned: true,
    author: DEMO_PROFILES[0],
  },
]

// ─── Emplois du temps ────────────────────────────────────────────────────────
//
// Créneaux de cours :
// Matin : 08:00-10:00 / récréation 10:00-10:10 / 10:10-12:00
// Pause déjeuner : 12:00-14:00
// Après-midi : 14:00-15:00 / récréation 15:00-15:10 / 15:10-16:00 ou 17:00
// Mercredi après-midi : repos
//
// Les pauses ne sont pas enregistrées comme des matières.

const timetableSlots: TimetableSlot[] = []

const addDay = (
  classeId: string,
  roomId: string,
  day: TimetableSlot['day_of_week'],
  subjects: string[],
  teacherIds: string[],
  afternoonEnd: '16:00' | '17:00',
) => {
  const periods = [
    ['08:00', '10:00'],
    ['10:10', '12:00'],
    ['14:00', '15:00'],
    ['15:10', afternoonEnd],
  ]

  subjects.forEach((subjectId, index) => {
    if (day === 3 && index >= 2) return

    const subject = DEMO_SUBJECTS.find(s => s.id === subjectId)
    const teacher = DEMO_TEACHERS.find(t => t.id === teacherIds[index])

    if (!subject || !teacher) return

    timetableSlots.push({
      id: `tt-${classeId}-${day}-${index}`,
      classe_id: classeId,
      subject_id: subjectId,
      teacher_id: teacher.id,
      room_id: roomId,
      day_of_week: day,
      start_time: periods[index][0],
      end_time: periods[index][1],
      academic_year_id: 'ay-2026-2027',
      subject,
      teacher,
      room: DEMO_ROOMS.find(r => r.id === roomId),
    })
  })
}

// 1ère année : arabe, mathématiques et activités de base
const schedule1 = [
  ['sub-1', 'sub-2', 'sub-2', 'sub-4'],
  ['sub-2', 'sub-1', 'sub-8', 'sub-8'],
  ['sub-1', 'sub-3'],
  ['sub-2', 'sub-1', 'sub-7', 'sub-7'],
  ['sub-1', 'sub-1', 'sub-9', 'sub-8'],
]

// 2ème année : consolidation des bases
const schedule2 = [
  ['sub-1', 'sub-2', 'sub-2', 'sub-4'],
  ['sub-2', 'sub-1', 'sub-8', 'sub-9'],
  ['sub-1', 'sub-3'],
  ['sub-2', 'sub-1', 'sub-7', 'sub-7'],
  ['sub-1', 'sub-2', 'sub-9', 'sub-8'],
]

// 3ème année : introduction du français
const schedule3 = [
  ['sub-1', 'sub-2', 'sub-5', 'sub-5'],
  ['sub-5', 'sub-2', 'sub-4', 'sub-8'],
  ['sub-1', 'sub-3'],
  ['sub-2', 'sub-1', 'sub-5', 'sub-7'],
  ['sub-5', 'sub-1', 'sub-8', 'sub-9'],
]

// 4ème année : français et introduction de l'anglais
const schedule4 = [
  ['sub-1', 'sub-2', 'sub-5', 'sub-5'],
  ['sub-5', 'sub-2', 'sub-6', 'sub-4'],
  ['sub-1', 'sub-3'],
  ['sub-2', 'sub-1', 'sub-5', 'sub-7'],
  ['sub-5', 'sub-6', 'sub-8', 'sub-9'],
]

// 5ème année : matières linguistiques et sociales
const schedule5 = [
  ['sub-2', 'sub-1', 'sub-5', 'sub-10'],
  ['sub-5', 'sub-2', 'sub-6', 'sub-12'],
  ['sub-3', 'sub-1'],
  ['sub-1', 'sub-5', 'sub-2', 'sub-7'],
  ['sub-2', 'sub-5', 'sub-6', 'sub-4'],
]

// 6ème année : préparation à la fin du primaire
const schedule6 = [
  ['sub-2', 'sub-1', 'sub-5', 'sub-11'],
  ['sub-5', 'sub-2', 'sub-6', 'sub-12'],
  ['sub-3', 'sub-1'],
  ['sub-1', 'sub-5', 'sub-2', 'sub-7'],
  ['sub-2', 'sub-5', 'sub-6', 'sub-4'],
]

const defaultTeachers = ['teacher-2', 'teacher-1', 'teacher-4', 'teacher-2']

const schedules = [
  { id: 'class-cp', room: 'room-1', data: schedule1, end: '16:00' as const },
  { id: 'class-ce1', room: 'room-2', data: schedule2, end: '16:00' as const },
  { id: 'class-ce2', room: 'room-3', data: schedule3, end: '17:00' as const },
  { id: 'class-cm1', room: 'room-4', data: schedule4, end: '17:00' as const },
  { id: 'class-cm2', room: 'room-5', data: schedule5, end: '17:00' as const },
  { id: 'class-6eme', room: 'room-6', data: schedule6, end: '17:00' as const },
]

schedules.forEach(schedule => {
  schedule.data.forEach((subjects, dayIndex) => {
    const day = (dayIndex + 1) as TimetableSlot['day_of_week']

    const teachers = subjects.map((subjectId) => {
      if (subjectId === 'sub-2') return 'teacher-1'
      if (subjectId === 'sub-3') return 'teacher-3'
      if (subjectId === 'sub-5' || subjectId === 'sub-6') return 'teacher-4'
      if (subjectId === 'sub-1') return 'teacher-2'
      return defaultTeachers[2]
    })

    addDay(
      schedule.id,
      schedule.room,
      day,
      subjects,
      teachers,
      schedule.end,
    )
  })
})

export const DEMO_TIMETABLE: TimetableSlot[] = timetableSlots

// ─── Paiements ───────────────────────────────────────────────────────────────
// Conservé pour compatibilité avec les autres modules.

export const DEMO_PAYMENTS: Payment[] = []
