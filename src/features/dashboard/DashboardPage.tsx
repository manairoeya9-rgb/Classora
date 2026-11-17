import { useNavigate } from 'react-router-dom'
import ParentSpace from './ParentSpace'
import StudentSpace from './StudentSpace'
import {
  Users, BookOpen, DollarSign, AlertCircle, TrendingUp,
  ClipboardCheck, Bell, GraduationCap, Calendar, BarChart3,
  Clock, FileText
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { PageWrapper } from '@/components/layout/Layout'
import { StatCard, Card, CardHeader } from '@/components/ui/Card'
import { Badge, AttendanceBadge, FeeBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatDate, formatGrade, gradeColor } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import {
  DEMO_STUDENTS, DEMO_TEACHERS, DEMO_CLASSES, DEMO_ANNOUNCEMENTS,
  DEMO_ATTENDANCE, DEMO_STUDENT_FEES, DEMO_HOMEWORK, DEMO_GRADES,
  DEMO_MESSAGES, DEMO_TIMETABLE
} from '@/lib/demo-data'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

// ─── Annonces récentes ───────────────────────────────────────────────────────

function AnnouncementsWidget() {
  return (
    <Card padding="none">
      <div className="p-6 border-b border-[var(--color-border)]">
        <CardHeader title="Annonces récentes" icon={<Bell size={16} />} />
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {DEMO_ANNOUNCEMENTS.slice(0, 3).map(ann => (
          <div key={ann.id} className="px-6 py-4 hover:bg-[var(--color-ivory)] transition-colors">
            <div className="flex items-start gap-3">
              {ann.is_pinned && (
                <span className="text-[var(--color-yellow)] mt-0.5 flex-shrink-0">📌</span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                  {ann.title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                  {ann.body}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  {formatDate(ann.published_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Tableau de bord Direction ───────────────────────────────────────────────

const monthlyRevenue = [
  { month: 'Sep', amount: 3200 },
  { month: 'Oct', amount: 5800 },
  { month: 'Nov', amount: 2100 },
  { month: 'Déc', amount: 800 },
]

const attendanceData = [
  { day: 'L', present: 118, absent: 7 },
  { day: 'M', present: 121, absent: 4 },
  { day: 'Mer', present: 115, absent: 10 },
  { day: 'J', present: 120, absent: 5 },
  { day: 'V', present: 119, absent: 6 },
]

function AdminDashboard() {
  const navigate = useNavigate()

  const totalStudents = DEMO_CLASSES.reduce(
    (sum, classe) => sum + (classe.student_count ?? 0),
    0
  )

  const unpaid = DEMO_STUDENT_FEES.filter(
    fee => fee.status === 'impaye'
  ).length

  const totalDue = DEMO_STUDENT_FEES.reduce(
    (sum, fee) => sum + fee.amount_due,
    0
  )

  const totalPaid = DEMO_STUDENT_FEES.reduce(
    (sum, fee) => sum + fee.amount_paid,
    0
  )

  const paymentPercentage = totalDue > 0
    ? Math.round((totalPaid / totalDue) * 100)
    : 0

  return (
    <PageWrapper
      title="Tableau de bord"
      subtitle="Vue d'ensemble de l'école — Année 2026-2027"
    >
      <div className="space-y-6">

        {/* Indicateurs principaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Élèves inscrits"
            value={totalStudents}
            subtitle={`${DEMO_CLASSES.length} classes actives`}
            icon={<Users size={18} />}
            color="forest"
            trend={{ value: 4, label: 'vs an dernier' }}
          />

          <StatCard
            title="Enseignants"
            value={DEMO_TEACHERS.length}
            subtitle="Tous actifs"
            icon={<GraduationCap size={18} />}
            color="sage"
          />

          <StatCard
            title="Frais collectés"
            value={formatCurrency(totalPaid)}
            subtitle={`${paymentPercentage}% du total`}
            icon={<DollarSign size={18} />}
            color="yellow"
          />

          <StatCard
            title="Impayés"
            value={unpaid}
            subtitle="élèves concernés"
            icon={<AlertCircle size={18} />}
            color="coral"
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <Card>
            <CardHeader
              title="Recettes du mois"
              subtitle="Paiements enregistrés en DT"
              icon={<BarChart3 size={16} />}
            />

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#244B3C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#244B3C" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9DF" />

                <XAxis dataKey="month" tick={{ fontSize: 11 }} />

                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={value => `${value} DT`}
                />

                <Tooltip
                  formatter={value => formatCurrency(Number(value ?? 0))}
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#244B3C"
                  fill="url(#grad)"
                  strokeWidth={2}
                  name="Recettes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader
              title="Présences cette semaine"
              subtitle="Par jour de la semaine"
              icon={<ClipboardCheck size={16} />}
            />

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9DF" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="present"
                  fill="#B8CDB8"
                  name="Présents"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="absent"
                  fill="#F2A58F"
                  name="Absents"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Informations complémentaires */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Élèves récents */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader
                title="Élèves récents"
                icon={<Users size={16} />}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/students')}
                  >
                    Voir tout
                  </Button>
                }
              />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {DEMO_STUDENTS.slice(0, 5).map(student => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-ivory)] transition-colors"
                >
                  <Avatar name={student.full_name} size="sm" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {student.classe?.name} • {student.student_number}
                    </p>
                  </div>

                  <Badge variant="sage" size="sm">
                    {student.status === 'actif' ? 'Actif' : student.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Frais impayés */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader
                title="Frais impayés"
                icon={<DollarSign size={16} />}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/fees')}
                  >
                    Gérer
                  </Button>
                }
              />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {DEMO_STUDENT_FEES
                .filter(fee => fee.status !== 'paye')
                .slice(0, 4)
                .map(fee => (
                  <div
                    key={fee.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-ivory)] transition-colors"
                  >
                    <Avatar name={fee.student?.full_name ?? ''} size="sm" />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {fee.student?.full_name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {fee.fee_type?.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <FeeBadge status={fee.status} />
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {formatCurrency(fee.amount_due - fee.amount_paid)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <AnnouncementsWidget />
        </div>
      </div>
    </PageWrapper>
  )
}

// ─── Tableau de bord Enseignant ──────────────────────────────────────────────

function TeacherDashboard() {
  const today = new Date()
  const dayOfWeek = today.getDay() || 7

  const todaySlots = DEMO_TIMETABLE
    .filter(slot => slot.day_of_week === dayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <PageWrapper
      title="Mon espace enseignant"
      subtitle={`Bonjour, enseignant — ${formatDate(today)}`}
    >
      <div className="space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Classes" value={2} subtitle="2 classes" icon={<BookOpen size={18} />} color="forest" />
          <StatCard title="Élèves" value={50} subtitle="Total sous ma responsabilité" icon={<Users size={18} />} color="sage" />
          <StatCard title="Devoirs en attente" value={3} subtitle="À corriger" icon={<FileText size={18} />} color="coral" />
          <StatCard title="Absents auj." value={2} subtitle="Sur 26 élèves" icon={<ClipboardCheck size={18} />} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Emploi du temps */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader
                title="Mon emploi du temps aujourd'hui"
                icon={<Calendar size={16} />}
              />
            </div>

            {todaySlots.length === 0 ? (
              <div className="p-6 text-center text-[var(--color-text-muted)] text-sm">
                Pas de cours aujourd'hui
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {todaySlots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-4 px-6 py-4">
                    <div
                      className="w-2 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: slot.subject?.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {slot.subject?.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {slot.start_time} – {slot.end_time} • {slot.room?.name}
                      </p>
                    </div>
                    <Badge variant="sage" size="sm" className="ml-auto">
                      {slot.classe?.name ?? ''}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Devoirs */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader
                title="Devoirs publiés"
                icon={<FileText size={16} />}
                action={<Button variant="ghost" size="sm">Voir tout</Button>}
              />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {DEMO_HOMEWORK.map(hw => (
                <div key={hw.id} className="px-6 py-4 hover:bg-[var(--color-ivory)] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {hw.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {hw.classe?.name} • {hw.subject?.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-text-muted)]">
                        <Clock size={10} />
                        Pour le {formatDate(hw.due_date)}
                      </div>
                    </div>
                    <Badge variant="blue" size="sm">
                      0/{hw.submission_count ?? 0} rendu(s)
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <AnnouncementsWidget />
      </div>
    </PageWrapper>
  )
}

// ─── Tableau de bord Parent ──────────────────────────────────────────────────

function ParentDashboard() {
  const child = DEMO_STUDENTS[0]

  const childGrades = DEMO_GRADES.filter(
    grade => grade.student_id === child.id
  )

  const avg = childGrades.length
    ? childGrades.reduce(
        (sum, grade) => sum + (grade.value / grade.max_value * 20),
        0
      ) / childGrades.length
    : 0

  const childFees = DEMO_STUDENT_FEES.filter(
    fee => fee.student_id === child.id
  )

  const balance = childFees.reduce(
    (sum, fee) => sum + (fee.amount_due - fee.amount_paid),
    0
  )

  return (
    <PageWrapper title="Espace parent" subtitle={`Suivi de ${child.full_name}`}>
      <div className="space-y-6">

        {/* Informations enfant */}
        <Card className="!bg-[var(--color-forest)] border-0">
          <div className="flex items-center gap-4">
            <Avatar name={child.full_name} size="xl" className="ring-4 ring-white/20" />

            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">
                Mon enfant
              </p>
              <h2 className="text-white font-bold text-xl font-serif">
                {child.full_name}
              </h2>
              <p className="text-white/70 text-sm">
                {child.classe?.name} • {child.student_number}
              </p>
            </div>

            <div className="ml-auto hidden sm:flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-yellow)]">
                  {avg.toFixed(1)}
                </p>
                <p className="text-white/60 text-xs">Moyenne générale</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-coral)]">
                  {formatCurrency(balance)}
                </p>
                <p className="text-white/60 text-xs">Solde dû</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Moyenne générale" value={`${avg.toFixed(1)}/20`} icon={<BarChart3 size={18} />} color="sage" />
          <StatCard title="Absences ce mois" value="1" subtitle="1 justifiée" icon={<ClipboardCheck size={18} />} color="yellow" />
          <StatCard title="Devoirs à rendre" value={DEMO_HOMEWORK.length} icon={<FileText size={18} />} color="lavender" />
          <StatCard title="Solde impayé" value={formatCurrency(balance)} icon={<DollarSign size={18} />} color="coral" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Notes */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader title="Dernières notes" icon={<BarChart3 size={16} />} />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {childGrades.map(grade => (
                <div key={grade.id} className="flex items-center gap-4 px-6 py-4">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: grade.subject?.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {grade.label}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {grade.subject?.name} • {formatDate(grade.date)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${gradeColor(grade.value)}`}>
                    {grade.value}/{grade.max_value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Messages */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader title="Messages récents" icon={<Bell size={16} />} />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {DEMO_MESSAGES
                .filter(msg => msg.recipient_id === 'user-parent-1' || msg.sender_id === 'user-parent-1')
                .map(msg => (
                  <div key={msg.id} className="px-6 py-4 hover:bg-[var(--color-ivory)] transition-colors">
                    <div className="flex items-start gap-2">
                      <Avatar name={msg.sender?.full_name ?? ''} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {msg.subject}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                          {msg.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        <AnnouncementsWidget />
      </div>
    </PageWrapper>
  )
}

// ─── Tableau de bord Élève ───────────────────────────────────────────────────

function StudentDashboard() {
  const student = DEMO_STUDENTS[0]

  const grades = DEMO_GRADES.filter(
    grade => grade.student_id === student.id
  )

  const avg = grades.length
    ? grades.reduce(
        (sum, grade) => sum + (grade.value / grade.max_value * 20),
        0
      ) / grades.length
    : 0

  const today = new Date()
  const dayOfWeek = today.getDay() || 7

  const todaySlots = DEMO_TIMETABLE.filter(
    slot => slot.day_of_week === dayOfWeek
  )

  return (
    <PageWrapper
      title="Mon espace élève"
      subtitle={`Bonjour, ${student.first_name} !`}
    >
      <div className="space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Moyenne générale" value={`${avg.toFixed(1)}/20`} icon={<BarChart3 size={18} />} color="forest" />
          <StatCard title="Cours aujourd'hui" value={todaySlots.length} icon={<Calendar size={18} />} color="sage" />
          <StatCard title="Devoirs à rendre" value={DEMO_HOMEWORK.length} icon={<FileText size={18} />} color="yellow" />
          <StatCard title="Mes absences" value="1" subtitle="ce trimestre" icon={<ClipboardCheck size={18} />} color="coral" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Cours du jour */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader title="Cours d'aujourd'hui" icon={<Calendar size={16} />} />
            </div>

            {todaySlots.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                Pas de cours aujourd'hui 🎉
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {todaySlots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 px-6 py-4">
                    <div
                      className="w-2 h-10 rounded-full"
                      style={{ backgroundColor: slot.subject?.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {slot.subject?.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {slot.start_time} – {slot.end_time} • {slot.teacher?.full_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Devoirs à rendre */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader title="Devoirs à rendre" icon={<FileText size={16} />} />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {DEMO_HOMEWORK.map(hw => (
                <div key={hw.id} className="px-6 py-4 hover:bg-[var(--color-ivory)] transition-colors">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {hw.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {hw.subject?.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={10} className="text-[var(--color-coral)]" />
                    <span className="text-xs text-[var(--color-coral)]">
                      Pour le {formatDate(hw.due_date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Dernières notes */}
        <Card>
          <CardHeader title="Mes dernières notes" icon={<BarChart3 size={16} />} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {grades.map(grade => (
              <div key={grade.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-ivory)]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: grade.subject?.color + '30' }}
                >
                  <span className="text-sm font-bold" style={{ color: grade.subject?.color }}>
                    {grade.value}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--color-text)]">
                    {grade.subject?.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {grade.label}
                  </p>
                </div>

                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${gradeColor(grade.value)}`}>
                  {grade.value}/{grade.max_value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <AnnouncementsWidget />
      </div>
    </PageWrapper>
  )
}

// ─── Tableau de bord Secrétariat ──────────────────────────────────────────────

function SecretariatDashboard() {
  const navigate = useNavigate()

  const unpaid = DEMO_STUDENT_FEES.filter(
    fee => fee.status === 'impaye'
  )

  const partial = DEMO_STUDENT_FEES.filter(
    fee => fee.status === 'partiel'
  )

  const totalDue = DEMO_STUDENT_FEES.reduce(
    (sum, fee) => sum + fee.amount_due,
    0
  )

  const totalPaid = DEMO_STUDENT_FEES.reduce(
    (sum, fee) => sum + fee.amount_paid,
    0
  )

  const paymentPercentage = totalDue > 0
    ? Math.round((totalPaid / totalDue) * 100)
    : 0

  return (
    <PageWrapper
      title="Secrétariat & Comptabilité"
      subtitle="Gestion administrative et financière"
    >
      <div className="space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Élèves inscrits"
            value={DEMO_STUDENTS.length}
            icon={<Users size={18} />}
            color="forest"
          />

          <StatCard
            title="Frais impayés"
            value={unpaid.length}
            subtitle="élèves"
            icon={<AlertCircle size={18} />}
            color="coral"
          />

          <StatCard
            title="Paiements partiels"
            value={partial.length}
            icon={<Clock size={18} />}
            color="yellow"
          />

          <StatCard
            title="Taux de paiement"
            value={`${paymentPercentage}%`}
            subtitle="du total attendu"
            icon={<TrendingUp size={18} />}
            color="sage"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Frais en attente */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader
                title="Frais en attente"
                icon={<DollarSign size={16} />}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/fees')}
                  >
                    Gérer
                  </Button>
                }
              />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {DEMO_STUDENT_FEES
                .filter(fee => fee.status !== 'paye')
                .map(fee => (
                  <div key={fee.id} className="flex items-center gap-3 px-6 py-3">
                    <Avatar name={fee.student?.full_name ?? ''} size="sm" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fee.student?.full_name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {fee.fee_type?.name}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <FeeBadge status={fee.status} />
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {formatCurrency(fee.amount_due - fee.amount_paid)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Présences du jour */}
          <Card padding="none">
            <div className="p-6 border-b border-[var(--color-border)]">
              <CardHeader title="Présences du jour" icon={<ClipboardCheck size={16} />} />
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {DEMO_ATTENDANCE.map(attendance => {
                const student = DEMO_STUDENTS.find(
                  item => item.id === attendance.student_id
                )

                return (
                  <div key={attendance.id} className="flex items-center gap-3 px-6 py-3">
                    <Avatar name={student?.full_name ?? ''} size="sm" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student?.full_name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {student?.classe?.name}
                      </p>
                    </div>

                    <AttendanceBadge status={attendance.status} />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <AnnouncementsWidget />
      </div>
    </PageWrapper>
  )
}

// ─── Routage du tableau de bord selon le rôle ─────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />

    case 'enseignant':
      return <TeacherDashboard />

    case 'parent':
      return <ParentSpace />

    case 'eleve':
      return <StudentSpace />

    case 'secretariat':
      return <SecretariatDashboard />

    default:
      return <AdminDashboard />
  }
}