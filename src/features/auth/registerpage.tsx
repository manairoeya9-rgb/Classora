import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        type: 'error',
        title: 'Mot de passe incorrect',
        message: 'Les deux mots de passe ne correspondent pas.',
      })
      return
    }

    setLoading(true)
    const result = await register(fullName, email, password, phone)
    setLoading(false)

    if (result.error) {
      toast({
        type: 'error',
        title: 'Inscription échouée',
        message: result.error,
      })
      return
    }

    if (result.needsEmailConfirmation) {
      toast({
        type: 'success',
        title: 'Vérifiez votre e-mail',
        message: 'Confirmez votre adresse e-mail avant de vous connecter.',
      })
      navigate('/login')
      return
    }

    toast({
      type: 'success',
      title: 'Compte créé',
      message: 'Votre compte Classora a été créé avec succès.',
    })

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-forest)] mb-8"
        >
          <ArrowLeft size={16} />
          Retour à la connexion
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Créer un compte
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Rejoignez Classora pour accéder à votre espace scolaire.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="register-name"
            label="Nom complet"
            type="text"
            placeholder="Votre nom complet"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            icon={<User size={14} />}
            autoComplete="name"
            required
          />

          <Input
            id="register-email"
            label="Adresse e-mail"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={14} />}
            autoComplete="email"
            required
          />

          <Input
            id="register-phone"
            label="Numéro de téléphone"
            type="tel"
            placeholder="+216 00 000 000"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            icon={<Phone size={14} />}
            hint="Le secrétariat utilise ce numéro pour retrouver votre compte et vous rattacher à vos enfants."
            autoComplete="tel"
            required
          />

          <Input
            id="register-password"
            label="Mot de passe (8 caractères minimum)"
            type={showPassword ? 'text' : 'password'}
            placeholder="Choisissez un mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Lock size={14} />}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            autoComplete="new-password"
            required
            minLength={8}
          />

          <Input
            id="register-confirm-password"
            label="Confirmer le mot de passe"
            type="password"
            placeholder="Retapez votre mot de passe"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            icon={<Lock size={14} />}
            autoComplete="new-password"
            required
          />

          <p className="text-xs text-[var(--color-text-muted)]">
            Les nouveaux comptes sont créés avec le rôle Parent. Les autres
            rôles doivent être attribués par l’administration.
          </p>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full mt-2"
            iconRight={<User size={16} />}
          >
            Créer mon compte
          </Button>
        </form>

        <p className="text-sm text-center text-[var(--color-text-muted)] mt-6">
          Vous avez déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--color-forest)] hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
