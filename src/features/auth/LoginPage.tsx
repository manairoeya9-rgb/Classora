
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await login(email, password)

    setLoading(false)

    if (error) {
      toast({
        type: 'error',
        title: 'Connexion échouée',
        message: error,
      })
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] flex-shrink-0 bg-[var(--color-forest)] p-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-20 -left-10 w-60 h-60 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7">
                <path
                  d="M18 3C10.268 3 4 9.268 4 17c0 5.5 2.98 10.32 7.42 12.94L18 33l6.58-3.06C29.02 27.32 32 22.5 32 17 32 9.268 25.732 3 18 3z"
                  fill="white"
                  fillOpacity="0.2"
                />
                <path
                  d="M18 6c-1.5 4-5 7-9 8 1 5 5 9 9 11 4-2 8-6 9-11-4-1-7.5-4-9-8z"
                  fill="white"
                  fillOpacity="0.5"
                />
                <path
                  d="M18 8v18M12 14l6-4 6 4M12 20l6-4 6 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="font-bold text-white text-2xl font-serif">
                Classora
              </p>
              <p className="text-white/50 text-xs">
                Le petit monde de l'apprentissage
              </p>
            </div>
          </div>
        </div>

        {/* Center Text */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white font-serif leading-tight mb-4">
            Bienvenue dans
            <br />
            votre espace
            <br />
            scolaire
          </h2>

          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Gérez votre école primaire en toute simplicité — notes, présences,
            devoirs, messagerie et bien plus, le tout depuis une seule
            plateforme.
          </p>

          {/* Feature Pills */}
          {[
            'Gestion des élèves & classes',
            'Notes et bulletins PDF',
            'Emploi du temps intelligent',
            'Communication école-famille',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[var(--color-sage)] flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="w-3 h-3"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-white/75 text-sm">{f}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/30 text-xs">
          © 2025-2026 Classora — École Primaire
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-forest)] flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[var(--color-forest)] font-serif">
              Classora
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">
            Connexion
          </h1>

          <p className="text-[var(--color-text-muted)] text-sm mb-8">
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
            <Input
              id="login-email"
              label="Adresse e-mail"
              type="email"
              placeholder="prenom.nom@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail size={14} />}
              required
              autoComplete="email"
            />

            <Input
              id="login-password"
              label="Mot de passe"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock size={14} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="hover:text-[var(--color-forest)] transition-colors"
                  aria-label={
                    showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                  }
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-2"
              iconRight={<ArrowRight size={16} />}
            >
              Se connecter
            </Button>
          </form>

          <p className="text-sm text-center mt-4">
            Vous n’avez pas de compte ?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-semibold text-[var(--color-forest)] hover:underline"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
