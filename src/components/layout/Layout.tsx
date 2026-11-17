import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, Calendar, BarChart3,
  ClipboardCheck, DollarSign, FileText, MessageSquare,
  Megaphone, History, Shield, Settings, LogOut, ChevronLeft,
  GraduationCap, Home, Bell, Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'
import type { UserRole } from '@/types'

// ─── Nav Items per Role ────────────────────────────────────────────────────────
interface NavItem { label: string; path: string; icon: React.ReactNode; roles: UserRole[] }

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', path: '/dashboard',   icon: <LayoutDashboard size={18} />, roles: ['admin','enseignant','parent','eleve','secretariat'] },
  { label: 'Élèves',          path: '/students',    icon: <Users size={18} />,           roles: ['admin','secretariat'] },
  { label: 'Classes',         path: '/classes',     icon: <BookOpen size={18} />,        roles: ['admin','enseignant'] },
  { label: 'Emploi du temps', path: '/timetable',   icon: <Calendar size={18} />,        roles: ['admin','enseignant','eleve'] },
  { label: 'Notes',           path: '/grades',      icon: <BarChart3 size={18} />,       roles: ['admin','enseignant','parent','eleve'] },
  { label: 'Présences',       path: '/attendance',  icon: <ClipboardCheck size={18} />,  roles: ['admin','enseignant','parent'] },
  { label: 'Scolarité',       path: '/fees',        icon: <DollarSign size={18} />,      roles: ['admin','secretariat','parent'] },
  { label: 'Devoirs',         path: '/homework',    icon: <FileText size={18} />,        roles: ['admin','enseignant','parent','eleve'] },
  { label: 'Messages',        path: '/messages',    icon: <MessageSquare size={18} />,   roles: ['admin','enseignant','parent','eleve','secretariat'] },
  { label: 'Annonces',        path: '/announcements',icon: <Megaphone size={18} />,     roles: ['admin','enseignant','parent','eleve','secretariat'] },
  { label: 'Historique',      path: '/history',     icon: <History size={18} />,         roles: ['admin','secretariat'] },
  { label: 'Audit',           path: '/audit',       icon: <Shield size={18} />,          roles: ['admin'] },
  { label: 'Paramètres',      path: '/settings',    icon: <Settings size={18} />,        roles: ['admin'] },
]

// ─── Logo ──────────────────────────────────────────────────────────────────────
function ClassoraLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5 px-1', collapsed && 'justify-center')}>
      <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-white/15 flex items-center justify-center">
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <path d="M18 3C10.268 3 4 9.268 4 17c0 5.5 2.98 10.32 7.42 12.94L18 33l6.58-3.06C29.02 27.32 32 22.5 32 17 32 9.268 25.732 3 18 3z" fill="white" fillOpacity="0.2"/>
          <path d="M18 6c-1.5 4-5 7-9 8 1 5 5 9 9 11 4-2 8-6 9-11-4-1-7.5-4-9-8z" fill="white" fillOpacity="0.5"/>
          <path d="M18 8v18M12 14l6-4 6 4M12 20l6-4 6 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!collapsed && (
        <div>
          <p className="font-bold text-white text-base leading-tight font-serif">Classora</p>
          <p className="text-[9px] text-white/50 leading-tight">Le petit monde de l'apprentissage</p>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, isRole } = useAuth()
  const navigate = useNavigate()

  const visibleItems = NAV_ITEMS.filter(item =>
    user && isRole(...item.roles)
  )

  return (
    <aside className={cn(
      'hidden lg:flex flex-col h-screen bg-[var(--color-forest)] flex-shrink-0',
      'transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="p-4 mb-2">
        <ClassoraLogo collapsed={collapsed} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn('sidebar-link mb-0.5', isActive && 'active')}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/10">
        {!collapsed && user && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <Avatar name={user.full_name} size="sm" />
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.full_name}</p>
              <p className="text-white/50 text-[10px] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="sidebar-link flex-1 text-red-300 hover:text-red-200 hover:bg-red-500/15"
            title="Déconnexion"
          >
            <LogOut size={16} />
            {!collapsed && 'Déconnexion'}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="sidebar-link p-2"
            title={collapsed ? 'Agrandir' : 'Réduire'}
          >
            <ChevronLeft size={16} className={cn('transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
interface TopBarProps { title: string; subtitle?: string; actions?: React.ReactNode }
export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { user } = useAuth()
  return (
    <header className="h-16 bg-white border-b border-[var(--color-border)] px-6 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="font-semibold text-[var(--color-text)] text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="relative p-2 rounded-xl hover:bg-[var(--color-ivory-dark)] transition-colors text-[var(--color-text-muted)]">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-coral)]" />
        </button>
        {user && <Avatar name={user.full_name} size="sm" />}
      </div>
    </header>
  )
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────────
export function MobileNav() {
  const { user, isRole } = useAuth()
  const MOBILE_ITEMS = NAV_ITEMS.slice(0, 5).filter(item => user && isRole(...item.roles))

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[var(--color-border)] z-40 safe-area-bottom">
      <div className="flex">
        {MOBILE_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-medium transition-colors',
              isActive ? 'text-[var(--color-forest)]' : 'text-[var(--color-text-muted)]'
            )}
          >
            {item.icon}
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// ─── Page Wrapper ──────────────────────────────────────────────────────────────
interface PageWrapperProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}
export function PageWrapper({ title, subtitle, actions, children }: PageWrapperProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={title} subtitle={subtitle} actions={actions} />
      <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6 page-enter">
        {children}
      </main>
    </div>
  )
}
