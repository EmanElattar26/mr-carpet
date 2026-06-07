import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Home() {
 const [msgName, setMsgName] = useState('')
const [msgPhone, setMsgPhone] = useState('')
const [msgText, setMsgText] = useState('')
const [msgSending, setMsgSending] = useState(false)
const [msgSent, setMsgSent] = useState(false)
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fadeIn = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  })

  return (
<div style={{ fontFamily: "'Almarai', sans-serif", direction: 'rtl', background: '#f0f9ff', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />

      {/* Hero */}
<div style={{ background: '#0c4a6e', padding: '48px 24px 52px', textAlign: 'center' }}>

  {/* لوجو */}
  <div style={{ ...fadeIn(0.1), width: 72, height: 72, background: '#fff', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: '#0284c7', lineHeight: 1 }}>Mr</div>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#0c4a6e', lineHeight: 1.4 }}>Carpet</div>
  </div>

  <div style={{ ...fadeIn(0.2), marginBottom: 6 }}>
    <span style={{ fontSize: 34, fontWeight: 700, color: '#fff' }}>Mr </span>
    <span style={{ fontSize: 34, fontWeight: 700, color: '#7dd3fc' }}>Carpet</span>
  </div>

  <p style={{ ...fadeIn(0.3), fontSize: 14, color: '#93c5fd', marginBottom: 36, lineHeight: 1.8 }}>
    خدمة الاستلام والتوصيل<br />مركز الزقازيق الشرقية
  </p>

  <div style={{ ...fadeIn(0.4), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    <div onClick={() => navigate('/new-order')}
      style={{ background: '#0284c7', borderRadius: 18, padding: '20px 12px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'transform 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <i className="ti ti-plus" style={{ fontSize: 26, color: '#fff' }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>طلب جديد</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>استلام وتوصيل</div>
    </div>

    <div onClick={() => navigate('/track')}
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 18, padding: '20px 12px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'transform 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <i className="ti ti-map-pin" style={{ fontSize: 26, color: '#7dd3fc' }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>تتبع طلبي</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>أدخل رقم جوالك</div>
    </div>
  </div>

</div>
      {/* تتبع سريع */}
      <div style={{ ...fadeIn(0.5), padding: '0 20px', marginTop: -20, position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '0.5px solid #e0f2fe' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e', marginBottom: 4 }}>تتبع طلبك</div>
          <div style={{ fontSize: 12, color: '#7dd3fc', marginBottom: 14 }}>أدخل رقم جوالك لمعرفة حالة طلبك</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="01xxxxxxxxx" type="tel" style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: "'Almarai', sans-serif", textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none' }} />
            <button onClick={() => navigate('/track')} style={{ padding: '11px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer' }}>بحث</button>
          </div>
        </div>
      </div>

      {/* خدماتنا */}
      <div style={{ padding: '28px 20px 8px' }}>
        <div style={{ ...fadeIn(0.6), fontSize: 16, fontWeight: 700, color: '#0c4a6e', marginBottom: 14 }}>خدماتنا</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: 'ti-truck', title: 'استلام وتوصيل', desc: 'نجي لبيتك ونوصل سجادتك نظيفة', delay: 0.7 },
            { icon: 'ti-sparkles', title: 'غسيل احترافي', desc: 'معدات حديثة ومواد آمنة', delay: 0.8 },
            { icon: 'ti-clock', title: 'تسليم سريع', desc: 'في أقل وقت ممكن', delay: 0.9 },
            { icon: 'ti-shield-check', title: 'ضمان الجودة', desc: 'نضمن نظافة سجادتك 100%', delay: 1.0 },
          ].map((s, i) => (
            <div key={i} style={{ ...fadeIn(s.delay), background: '#fff', borderRadius: 14, padding: 16, border: '0.5px solid #e0f2fe' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#7dd3fc', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

    {/* تواصل معنا */}
<div style={{ padding: '20px 20px 28px' }}>
  <div style={{ ...fadeIn(1.1), fontSize: 16, fontWeight: 700, color: '#0c4a6e', marginBottom: 14 }}>تواصل معنا</div>
  <div style={{ ...fadeIn(1.2), background: '#fff', borderRadius: 16, padding: 16, border: '0.5px solid #e0f2fe' }}>
    <input
      placeholder="اسمك"
      value={msgName}
      onChange={e => setMsgName(e.target.value)}
      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 13, fontFamily: 'Almarai, sans-serif', textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 8 }}
    />
    <input
      placeholder="رقم تليفونك"
      type="tel"
      value={msgPhone}
      onChange={e => setMsgPhone(e.target.value)}
      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 13, fontFamily: 'Almarai, sans-serif', textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 8 }}
    />
    <div style={{ display: 'flex', gap: 8, borderTop: '0.5px solid #e0f2fe', paddingTop: 12 }}>
      <button
        onClick={async () => {
          if (!msgText.trim()) return
          setMsgSending(true)
          await supabase.from('messages').insert({ name: msgName, phone: msgPhone, message: msgText })
          setMsgName('')
          setMsgPhone('')
          setMsgText('')
          setMsgSent(true)
          setMsgSending(false)
          setTimeout(() => setMsgSent(false), 3000)
        }}
        style={{ width: 38, height: 38, background: msgSending ? '#7dd3fc' : '#0284c7', border: 'none', borderRadius: 10, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ti ti-send" style={{ fontSize: 16, color: '#fff' }} />
      </button>
      <input
        placeholder="اكتب رسالتك..."
        value={msgText}
        onChange={e => setMsgText(e.target.value)}
        style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 13, fontFamily: 'Almarai, sans-serif', textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none' }} />
    </div>
    {msgSent && (
      <div style={{ marginTop: 10, background: '#dcfce7', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#166534', textAlign: 'center', fontWeight: 700 }}>
        ✅ تم إرسال رسالتك بنجاح
      </div>
    )}
  </div>
</div>

      {/* Footer */}
      <div style={{ background: '#0c4a6e', color: '#7dd3fc', textAlign: 'center', padding: 20, fontSize: 12 }}>
        Mr Carpet — مركز الزقازيق الشرقية
      </div>

    </div>
  )
}