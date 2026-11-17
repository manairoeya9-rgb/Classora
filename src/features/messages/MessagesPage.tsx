import { useState } from 'react'
import { Send, Inbox, MailOpen, Archive, Plus, Search } from 'lucide-react'
import { PageWrapper } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { DEMO_MESSAGES, DEMO_ANNOUNCEMENTS, DEMO_PROFILES } from '@/lib/demo-data'
import { useAuth } from '@/features/auth/AuthProvider'
import type { Message, Announcement } from '@/types'
import { cn } from '@/lib/utils'

type Tab = 'inbox' | 'sent' | 'announcements'

const RECIPIENT_OPTS = DEMO_PROFILES.map(p => ({ value: p.id, label: `${p.full_name} (${p.role})` }))

export default function MessagesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('inbox')
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES as Message[])
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEMO_ANNOUNCEMENTS as Announcement[])
  const [selected, setSelected] = useState<Message | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [annOpen, setAnnOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ recipient_id: '', subject: '', body: '' })
  const [annForm, setAnnForm] = useState({ title: '', body: '', is_pinned: false })
  const [search, setSearch] = useState('')

  const inbox = messages.filter(m => m.recipient_id === user?.id)
  const sent  = messages.filter(m => m.sender_id === user?.id)

  const filteredInbox = inbox.filter(m =>
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.sender?.full_name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSend() {
    if (!form.recipient_id || !form.subject || !form.body) {
      toast({ type: 'error', title: 'Champs manquants' }); return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    const msg: Message = {
      id: `msg-${Date.now()}`,
      sender_id: user?.id ?? '',
      recipient_id: form.recipient_id,
      subject: form.subject,
      body: form.body,
      sent_at: new Date().toISOString(),
      is_archived: false,
      sender: user ?? undefined,
      recipient: DEMO_PROFILES.find(p => p.id === form.recipient_id),
    }
    setMessages(ms => [...ms, msg])
    toast({ type: 'success', title: 'Message envoyé !' })
    setComposeOpen(false)
    setSaving(false)
  }

  async function handleAnnouncement() {
    if (!annForm.title || !annForm.body) {
      toast({ type: 'error', title: 'Champs manquants' }); return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      title: annForm.title,
      body: annForm.body,
      author_id: user?.id ?? '',
      target_roles: ['parent', 'enseignant', 'eleve', 'admin', 'secretariat'],
      published_at: new Date().toISOString(),
      is_pinned: annForm.is_pinned,
      author: user ?? undefined,
    }
    setAnnouncements(as => [ann, ...as])
    toast({ type: 'success', title: 'Annonce publiée' })
    setAnnOpen(false)
    setSaving(false)
  }

  function markRead(msg: Message) {
    if (!msg.read_at) {
      setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m))
    }
    setSelected(msg)
  }

  const unread = inbox.filter(m => !m.read_at).length

  return (
    <PageWrapper
      title="Messages & Annonces"
      subtitle="Communication interne entre rôles"
      actions={
        <div className="flex items-center gap-2">
          {(user?.role === 'admin') && (
            <Button variant="secondary" icon={<Plus size={16} />} onClick={() => { setAnnForm({ title:'', body:'', is_pinned: false }); setAnnOpen(true) }}>
              Nouvelle annonce
            </Button>
          )}
          <Button icon={<Plus size={16} />} onClick={() => { setForm({ recipient_id:'', subject:'', body:'' }); setComposeOpen(true) }}>
            Nouveau message
          </Button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        {/* Left Panel */}
        <div className="w-72 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col">
          {/* Tabs */}
          <div className="p-3 border-b border-[var(--color-border)]">
            <div className="flex gap-1 p-1 bg-[var(--color-ivory)] rounded-xl">
              {([['inbox','Boîte',unread],['sent','Envoyés',0],['announcements','Annonces',0]] as [Tab,string,number][]).map(([t, label, count]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                    tab === t ? 'bg-white text-[var(--color-forest)] shadow-sm' : 'text-[var(--color-text-muted)]'
                  )}>
                  {label}
                  {count > 0 && <span className="w-4 h-4 rounded-full bg-[var(--color-coral)] text-white text-[9px] flex items-center justify-center">{count}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs bg-[var(--color-ivory)] rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-[var(--color-forest)]" />
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
            {tab === 'inbox' && (filteredInbox.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">Boîte vide</div>
            ) : filteredInbox.map(msg => (
              <div key={msg.id} onClick={() => markRead(msg)}
                className={cn('p-3 cursor-pointer transition-colors hover:bg-[var(--color-ivory)]', selected?.id === msg.id && 'bg-[var(--color-sage-light)]')}>
                <div className="flex items-center gap-2 mb-1">
                  <Avatar name={msg.sender?.full_name ?? '?'} size="xs" />
                  <span className={cn('text-xs flex-1 truncate', !msg.read_at && 'font-bold text-[var(--color-text)]', msg.read_at && 'text-[var(--color-text-muted)]')}>
                    {msg.sender?.full_name}
                  </span>
                  {!msg.read_at && <span className="w-2 h-2 rounded-full bg-[var(--color-forest)] flex-shrink-0" />}
                </div>
                <p className={cn('text-xs truncate', !msg.read_at ? 'font-semibold' : 'text-[var(--color-text-muted)]')}>{msg.subject}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">{msg.body.slice(0, 60)}…</p>
              </div>
            )))}
            {tab === 'sent' && sent.map(msg => (
              <div key={msg.id} onClick={() => setSelected(msg)}
                className={cn('p-3 cursor-pointer transition-colors hover:bg-[var(--color-ivory)]', selected?.id === msg.id && 'bg-[var(--color-sage-light)]')}>
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">À : {msg.recipient?.full_name}</p>
                <p className="text-xs font-medium text-[var(--color-text)] truncate">{msg.subject}</p>
              </div>
            ))}
            {tab === 'announcements' && announcements.map(ann => (
              <div key={ann.id} onClick={() => setSelected(null)}
                className="p-3 cursor-pointer hover:bg-[var(--color-ivory)] transition-colors">
                {ann.is_pinned && <span className="text-[10px] text-[var(--color-yellow)] font-bold">📌 Épinglé</span>}
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">{ann.title}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{formatDate(ann.published_at)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel — Message Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar name={tab === 'sent' ? (selected.recipient?.full_name ?? '?') : (selected.sender?.full_name ?? '?')} size="md" />
                <div className="flex-1">
                  <h2 className="font-semibold text-[var(--color-text)] text-lg">{selected.subject}</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {tab === 'sent' ? `À : ${selected.recipient?.full_name}` : `De : ${selected.sender?.full_name}`}
                    {' · '}{formatDate(selected.sent_at)}
                  </p>
                </div>
                <Button size="sm" variant="ghost" icon={<Send size={12} />} onClick={() => {
                  setForm({ recipient_id: tab === 'sent' ? selected.recipient_id : selected.sender_id, subject: `RE: ${selected.subject}`, body: '' })
                  setComposeOpen(true)
                }}>Répondre</Button>
              </div>
              <div className="prose prose-sm max-w-none">
                {selected.body.split('\n').map((line, i) => <p key={i} className="mb-2 text-sm text-[var(--color-text)]">{line}</p>)}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Inbox size={40} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-30" />
                <p className="text-sm text-[var(--color-text-muted)]">Sélectionnez un message</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="Nouveau message" size="md"
        footer={<><Button variant="ghost" onClick={() => setComposeOpen(false)}>Annuler</Button><Button icon={<Send size={14} />} onClick={handleSend} loading={saving}>Envoyer</Button></>}>
        <div className="flex flex-col gap-4">
          <Select label="Destinataire" options={RECIPIENT_OPTS} value={form.recipient_id} onChange={e => setForm(f => ({...f, recipient_id: e.target.value}))} placeholder="Choisir un destinataire" required />
          <Input label="Objet" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="Sujet du message" required />
          <Textarea label="Message" value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} placeholder="Rédigez votre message…" rows={6} required />
        </div>
      </Modal>

      {/* Announcement Modal */}
      <Modal open={annOpen} onClose={() => setAnnOpen(false)} title="Publier une annonce" size="md"
        footer={<><Button variant="ghost" onClick={() => setAnnOpen(false)}>Annuler</Button><Button onClick={handleAnnouncement} loading={saving}>Publier</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Titre de l'annonce" value={annForm.title} onChange={e => setAnnForm(f => ({...f, title: e.target.value}))} placeholder="Réunion parents…" required />
          <Textarea label="Contenu" value={annForm.body} onChange={e => setAnnForm(f => ({...f, body: e.target.value}))} placeholder="Détaillez l'annonce…" rows={5} required />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={annForm.is_pinned} onChange={e => setAnnForm(f => ({...f, is_pinned: e.target.checked}))} className="rounded accent-[var(--color-forest)]" />
            <span className="text-sm font-medium">📌 Épingler cette annonce</span>
          </label>
        </div>
      </Modal>
    </PageWrapper>
  )
}
