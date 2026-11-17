import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale = 'fr-FR') {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(date))
}

export function formatCurrency(amount: number, currency = 'XAF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency, minimumFractionDigits: 0
  }).format(amount)
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function formatGrade(grade: number | null): string {
  if (grade === null) return '—'
  return grade.toFixed(2)
}

export function gradeColor(grade: number): string {
  if (grade >= 16) return 'badge-green'
  if (grade >= 12) return 'badge-blue'
  if (grade >= 10) return 'badge-yellow'
  return 'badge-red'
}

export function gradeLabel(grade: number): string {
  if (grade >= 16) return 'Très bien'
  if (grade >= 14) return 'Bien'
  if (grade >= 12) return 'Assez bien'
  if (grade >= 10) return 'Passable'
  return 'Insuffisant'
}

export function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
