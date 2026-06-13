'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password)
      { setError('Please enter email and password'); return }
    setLoading(true)
    try {
      const { error: e } = await supabase.auth.signInWithPassword(
        { email, password }
      )
      if (e) throw e
      router.push('/dashboard')
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('TypeError')) {
        setError('Connection error: Could not connect to the Supabase server. Please verify your connection or project settings in .env.local.')
      } else if (msg.includes('Invalid login'))
        setError('Email or password is incorrect.')
      else if (msg.includes('Email not confirmed'))
        setError('Please verify your email first.')
      else if (msg.includes('disabled'))
        setError('Your account is inactive.')
      else
        setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full h-[52px] px-4 bg-white/[0.06]
    border border-white/[0.12] rounded-xl text-white
    text-[15px] placeholder:text-white/30
    focus:outline-none focus:border-[#66BB6A]`

  return (
    <div className="min-h-screen flex items-center justify-center
      px-4" style={{ background: '#050f07' }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <div className="text-[32px] font-extrabold text-[#66BB6A]">
            ∞ EcoVerse
          </div>
          <p className="text-white/40 text-[14px] mt-1">
            Welcome back
          </p>
        </div>

        {error && (
          <div className="bg-[rgba(239,83,80,0.12)] border
            border-[rgba(239,83,80,0.3)] rounded-xl px-4 py-3
            text-[#ef9a9a] text-[13px] mb-5">
            ⚠ {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input className={inputCls}
            type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              className={inputCls + ' pr-12'}
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2
                text-white/40 text-[12px]">
              {show ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="text-right">
            <a href="/auth/reset-password"
              className="text-[#66BB6A] text-[13px] font-semibold">
              Forgot Password?
            </a>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-[52px] bg-[#2E7D32] text-white
              font-bold rounded-xl text-[16px]
              hover:bg-[#388E3C] transition-all
              disabled:opacity-50">
            {loading ? 'Signing in...' : '→ Sign In'}
          </button>

          <p className="text-center text-white/40 text-[13px]">
            New to EcoVerse?{' '}
            <a href="/auth/signup"
              className="text-[#66BB6A] font-semibold">
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
