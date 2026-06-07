import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!phone || !password) { setError('أدخل رقم التليفون وكلمة السر'); return }
    setLoading(true)
    setError('')

    const { data: user } = await supabase
      .from('app_users')
      .select('*')
      .eq('phone', phone)
      .eq('password', password)
      .eq('is_active', true)
      .single()

    if (!user) {
      setError('رقم التليفون أو كلمة السر غلط')
      setLoading(false)
      return
    }

    localStorage.setItem('mr_carpet_user', JSON.stringify(user))
    navigate('/admin')
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid #bae6fd', fontSize: 14,
    fontFamily: "'Almarai', sans-serif", textAlign: 'right',
    background: '#f0f9ff', color: '#0c4a6e', outline: 'none',
    display: 'block'
  }

  return (
    <div style={{ fontFamily: "'Almarai', sans-serif", direction: 'rtl', background: '#0c4a6e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* لوجو */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>
            Mr <span style={{ color: '#7dd3fc' }}>Carpet</span>
          </div>
          <div style={{ fontSize: 13, color: '#93c5fd', marginTop: 6 }}>لوحة التحكم</div>
        </div>

        {/* فورم */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0c4a6e', marginBottom: 24, textAlign: 'center' }}>
            تسجيل الدخول
          </div>

          {/* رقم التليفون */}
         <div style={{ marginBottom: 16, textAlign: 'right' }}>
  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6, paddingRight: 4 }}>
              رقم التليفون
            </label>
            <input
              placeholder="01xxxxxxxxx"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* كلمة السر */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 8 }}>
              كلمة السر
            </label>
            <input
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: 14, background: loading ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </div>

      </div>
    </div>
  )
}