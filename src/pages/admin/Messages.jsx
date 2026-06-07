import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './Dashboard'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchMessages()
    const sub = supabase.channel('admin-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  async function fetchMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setMessages(data || [])
  }

  async function markRead(id) {
    await supabase.from('messages').update({ is_read: true }).eq('id', id)
    await fetchMessages()
  }

  async function handleDelete(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await supabase.from('messages').delete().eq('id', id)
    setSelected(null)
    await fetchMessages()
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <AdminLayout currentPath="/admin/messages">
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />

      <div style={{ display: 'flex', gap: 20 }}>

        {/* قائمة الرسائل */}
        <div style={{ flex: selected ? '0 0 380px' : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>الرسائل</div>
              {unread > 0 && (
                <span style={{ background: '#0284c7', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  {unread} جديد
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id}
                onClick={() => { setSelected(msg); if (!msg.is_read) markRead(msg.id) }}
                style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: selected?.id === msg.id ? '2px solid #0284c7' : '0.5px solid #e0f2fe', cursor: 'pointer', position: 'relative' }}
                onMouseEnter={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = '#f0f9ff' }}
                onMouseLeave={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = '#fff' }}>
                {!msg.is_read && (
                  <div style={{ position: 'absolute', top: 14, left: 16, width: 8, height: 8, background: '#0284c7', borderRadius: '50%' }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: '#7dd3fc' }}>{new Date(msg.created_at).toLocaleDateString('ar-EG')}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>{msg.name || 'زائر'}</div>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {msg.message}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#7dd3fc', padding: 40, fontSize: 14 }}>
                <i className="ti ti-inbox" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
                لا توجد رسائل
              </div>
            )}
          </div>
        </div>

        {/* تفاصيل الرسالة */}
        {selected && (
          <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: 20, border: '0.5px solid #e0f2fe', alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleDelete(selected.id)}
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#dc2626', cursor: 'pointer', fontFamily: 'Almarai, sans-serif' }}>
                  حذف
                </button>
                <button onClick={() => setSelected(null)}
                  style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#0284c7', cursor: 'pointer', fontFamily: 'Almarai, sans-serif' }}>
                  إغلاق
                </button>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>تفاصيل الرسالة</div>
            </div>

            {/* بيانات المرسل */}
            <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#7dd3fc', marginBottom: 8 }}>بيانات المرسل</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>{selected.name || 'زائر'}</div>
              {selected.phone && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                   <a href={`https://wa.me/2${selected.phone}?text=${encodeURIComponent('مرحباً، نتواصل معك من مغسلة Mr Carpet')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: '6px 12px', background: '#25D366', borderRadius: 8, fontSize: 12, color: '#fff', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Almarai, sans-serif' }}>
                    <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} />
                    رد عبر واتساب
                  </a>
                  <div style={{ fontSize: 13, color: '#0284c7' }}>{selected.phone}</div>
                </div>
              )}
            </div>

            {/* الرسالة */}
            <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#7dd3fc', marginBottom: 8 }}>الرسالة</div>
              <div style={{ fontSize: 14, color: '#0c4a6e', lineHeight: 1.8 }}>{selected.message}</div>
            </div>

            <div style={{ fontSize: 12, color: '#7dd3fc', textAlign: 'left' }}>
              {new Date(selected.created_at).toLocaleString('ar-EG')}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}