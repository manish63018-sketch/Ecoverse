'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { INDIA_STATES, getCitiesForState } from '@/data/india-locations'

const ROLES = [
  { id:'rescuer', label:'Animal Rescuer', emoji:'🐾' },
  { id:'medical_care', label:'Medical Care', emoji:'🏥' },
  { id:'transport', label:'Transport Volunteer', emoji:'🚗' },
  { id:'foster', label:'Foster Parent', emoji:'🏠' },
  { id:'adopter', label:'Adopter', emoji:'💚' },
  { id:'street_feeder', label:'Street Feeder', emoji:'🍱' },
  { id:'ngo_staff', label:'NGO Staff', emoji:'🏢' },
  { id:'vegan_advocate', label:'Vegan Advocate', emoji:'🌱' },
  { id:'volunteer', label:'General Volunteer', emoji:'🤝' },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    state_name: '',
    city_name: '',
    area_name: '',
    roles: [] as string[],
    primary_role: 'volunteer',
    available_now: false,
    agree_terms: false,
  })

  const cities = getCitiesForState(form.state_name)

  function update(k: string, v: any) {
    setForm(p => ({ ...p, [k]: v }))
    setError('')
  }

  function toggleRole(id: string) {
    setForm(p => ({
      ...p,
      roles: p.roles.includes(id)
        ? p.roles.filter(r => r !== id)
        : [...p.roles, id].slice(0, 3),
      primary_role: p.roles.includes(id) ? p.primary_role : id
    }))
  }

  async function handleSignup() {
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match'); return
    }
    if (!form.agree_terms) {
      setError('Please agree to terms'); return
    }
    if (form.roles.length === 0) {
      setError('Please select at least one role'); return
    }
    setLoading(true)
    try {
      const { data, error: authError } =
        await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.full_name,
              username: form.username,
            }
          }
        })
      if (authError) throw authError

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: form.full_name,
            username: form.username,
            email: form.email,
            phone: form.phone,
            state_name: form.state_name,
            city_name: form.city_name,
            area_name: form.area_name,
            roles: form.roles,
            primary_role: form.roles[0] ?? 'volunteer',
            available_now: form.available_now,
          })
        if (profileError) throw profileError
        router.push('/dashboard')
      }
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg.includes('already registered'))
        setError('This email is already registered. Please login.')
      else if (msg.includes('Password'))
        setError('Password must be at least 6 characters.')
      else if (msg.includes('invalid'))
        setError('Invalid email address.')
      else
        setError('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full h-[48px] px-4 bg-white/[0.06]
    border border-white/[0.12] rounded-xl text-white
    text-[14px] placeholder:text-white/30
    focus:outline-none focus:border-[#66BB6A]`

  const labelCls = `text-[11px] text-white/50 font-semibold
    uppercase tracking-wide block mb-1`

  return (
    <div className="min-h-screen flex items-center justify-center
      px-4 py-12" style={{ background: '#050f07' }}>
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-[28px] font-extrabold text-[#66BB6A]">
            ∞ EcoVerse
          </div>
          <p className="text-white/40 text-[13px] mt-1">
            One Earth. One Community.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full
              transition-all ${step >= s
                ? 'bg-[#66BB6A]' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Step titles */}
        <h2 className="text-[22px] font-bold text-white mb-6">
          {step === 1 && 'Create Your Account'}
          {step === 2 && 'Your Location'}
          {step === 3 && 'Choose Your Role'}
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-[rgba(239,83,80,0.15)] border
            border-[rgba(239,83,80,0.3)] rounded-xl px-4 py-3
            text-[#ef9a9a] text-[13px] mb-5">
            ⚠ {error}
          </div>
        )}

        {/* STEP 1 — Basic Info */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input className={inputCls}
                placeholder="Arjun Sharma"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Username *</label>
              <input className={inputCls}
                placeholder="arjun_rescues"
                value={form.username}
                onChange={e => update('username',
                  e.target.value.toLowerCase().replace(/\s/g, '_'))}
              />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input className={inputCls}
                type="email" placeholder="you@email.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Password *</label>
              <input className={inputCls}
                type="password" placeholder="Min 6 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Confirm Password *</label>
              <input className={inputCls}
                type="password"
                value={form.confirm_password}
                onChange={e => update('confirm_password', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Phone (optional)</label>
              <input className={inputCls}
                type="tel" placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                if (!form.full_name || !form.email || !form.password)
                  { setError('Please fill all required fields'); return }
                if (form.password.length < 6)
                  { setError('Password must be at least 6 characters'); return }
                setStep(2)
              }}
              className="w-full h-[52px] bg-[#2E7D32] text-white
                font-bold rounded-xl text-[15px] mt-2
                hover:bg-[#388E3C] transition-all">
              Continue →
            </button>
            <p className="text-center text-white/40 text-[13px]">
              Already have an account?{' '}
              <a href="/auth/login"
                className="text-[#66BB6A] font-semibold">
                Sign in
              </a>
            </p>
          </div>
        )}

        {/* STEP 2 — Location */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>State *</label>
              <select
                value={form.state_name}
                onChange={e => {
                  update('state_name', e.target.value)
                  update('city_name', '')
                }}
                className={inputCls}
                style={{ background: '#0a1a0e' }}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>City *</label>
              <select
                value={form.city_name}
                onChange={e => update('city_name', e.target.value)}
                disabled={!form.state_name}
                className={inputCls}
                style={{ background: '#0a1a0e' }}>
                <option value="">Select City</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Area / Zone</label>
              <input className={inputCls}
                placeholder="Banjara Hills, Koramangala..."
                value={form.area_name}
                onChange={e => update('area_name', e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)}
                className="flex-1 h-[52px] border border-white/20
                  text-white/70 rounded-xl font-semibold">
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!form.state_name || !form.city_name)
                    { setError('Please select state and city'); return }
                  setStep(3)
                }}
                className="flex-1 h-[52px] bg-[#2E7D32] text-white
                  font-bold rounded-xl text-[15px]
                  hover:bg-[#388E3C] transition-all">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Roles */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-white/50 text-[13px]">
              Select up to 3 roles. These determine your alerts
              and permissions.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(r => (
                <button key={r.id}
                  onClick={() => toggleRole(r.id)}
                  className={`flex items-center gap-3 px-4 py-3
                    rounded-xl border text-left transition-all
                    ${form.roles.includes(r.id)
                      ? 'border-[#66BB6A] bg-[rgba(46,125,50,0.2)]'
                      : 'border-white/[0.1] bg-white/[0.04]'}`}>
                  <span className="text-[22px]">{r.emoji}</span>
                  <span className={`font-semibold text-[14px]
                    ${form.roles.includes(r.id)
                      ? 'text-[#66BB6A]' : 'text-white/80'}`}>
                    {r.label}
                  </span>
                  {form.roles.includes(r.id) && (
                    <span className="ml-auto text-[#66BB6A]">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Available Now toggle */}
            <div className="flex items-center justify-between
              bg-white/[0.05] border border-white/[0.1]
              rounded-xl px-4 py-3">
              <div>
                <p className="text-white text-[14px] font-semibold">
                  Available for rescue now?
                </p>
                <p className="text-white/40 text-[11px]">
                  Receive SOS alerts near you
                </p>
              </div>
              <button
                onClick={() => update('available_now',
                  !form.available_now)}
                className={`w-12 h-6 rounded-full relative
                  transition-all ${form.available_now
                    ? 'bg-[#2E7D32]' : 'bg-white/20'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white
                  rounded-full transition-all shadow
                  ${form.available_now
                    ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox"
                checked={form.agree_terms}
                onChange={e => update('agree_terms', e.target.checked)}
                className="mt-0.5 accent-[#66BB6A]"
              />
              <span className="text-white/50 text-[12px]">
                I agree to EcoVerse's community guidelines and
                terms. I will treat all members and animals with
                compassion.
              </span>
            </label>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 h-[52px] border border-white/20
                  text-white/70 rounded-xl font-semibold">
                ← Back
              </button>
              <button
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 h-[52px] bg-[#2E7D32] text-white
                  font-bold rounded-xl text-[15px]
                  hover:bg-[#388E3C] transition-all
                  disabled:opacity-50">
                {loading ? 'Creating...' : 'Join EcoVerse 🌍'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
