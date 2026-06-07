import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function DriverApp() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [driver, setDriver] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('pickup')
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mr_carpet_driver')
    if (saved) setDriver(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!driver) return
    fetchOrders()
    const sub = supabase.channel('driver-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders()
        if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && payload.new.status === 'ready')) {
          setNotifications(prev => [{
            id: payload.new.id,
            text: payload.new.status === 'ready' ? 'طلب جاهز للتوصيل' : 'طلب جديد للاستلام',
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            read: false,
          }, ...prev].slice(0, 10))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [driver])

  async function handleLogin() {
    if (!phone || !password) { setError('أدخل رقم التليفون وكلمة السر'); return }
    setLoading(true)
    setError('')
    const { data } = await supabase.from('drivers').select('*').eq('phone', phone).eq('password', password).eq('is_active', true).single()
    if (!data) {
      setError('رقم التليفون أو كلمة السر غلط')
      setLoading(false)
      return
    }
    setDriver(data)
    localStorage.setItem('mr_carpet_driver', JSON.stringify(data))
    setLoading(false)
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(name, phone), order_items(*)')
      .in('status', ['received', 'ready'])
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function handleAction(order) {
    setLoading(true)
    const nextStatus = order.status === 'received' ? 'picked_up' : 'delivered'
    await supabase.from('orders').update({ status: nextStatus, driver_id: driver.id }).eq('id', order.id)
    await fetchOrders()
    setLoading(false)
  }

  function openMap(notes) {
    if (!notes) return
    const coords = notes.split(',')
    if (coords.length === 2) {
      window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, '_blank')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const toPickup = orders.filter(o => o.status === 'received' && o.type === 'pickup')
  const toDeliver = orders.filter(o => o.status === 'ready')

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: "'Almarai', sans-serif", textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 16 }

  if (!driver) {
    return (
      <div style={{ fontFamily: "'Almarai', sans-serif", direction: 'rtl', background: '#0c4a6e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>Mr <span style={{ color: '#7dd3fc' }}>Carpet</span></div>
            <div style={{ fontSize: 13, color: '#93c5fd', marginTop: 4 }}>بوابة السائق</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e', marginBottom: 20, textAlign: 'center' }}>تسجيل الدخول</div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>رقم التليفون</label>
            <input placeholder="01xxxxxxxxx" type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>كلمة السر</label>
            <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inputStyle} />
            {error && <div style={{ color: 'red', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
            <button onClick={handleLogin} disabled={loading}
              style={{ width: '100%', padding: 13, background: loading ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer' }}>
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentOrders = activeTab === 'pickup' ? toPickup : toDeliver

  return (
    <div style={{ fontFamily: "'Almarai', sans-serif", direction: 'rtl', background: '#f0f9ff', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: '#0c4a6e', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* الإشعارات */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowNotif(!showNotif); setNotifications(p => p.map(n => ({ ...n, read: true }))) }}
              style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <i className="ti ti-bell" style={{ fontSize: 18, color: '#fff' }} />
              {unreadCount > 0 && <div style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, background: '#f87171', borderRadius: '50%' }} />}
            </button>
            {showNotif && (
              <div style={{ position: 'absolute', top: 44, right: 0, width: 260, background: '#fff', borderRadius: 14, border: '0.5px solid #e0f2fe', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200 }}>
                <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #e0f2fe', fontSize: 13, fontWeight: 700, color: '#0c4a6e' }}>الإشعارات</div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#7dd3fc', fontSize: 13 }}>لا توجد إشعارات</div>
                ) : notifications.map((n, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderBottom: '0.5px solid #f0f9ff', background: n.read ? '#fff' : '#f0f9ff' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e' }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: '#7dd3fc' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => { setDriver(null); localStorage.removeItem('mr_carpet_driver') }}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}>
            خروج
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{driver.name}</div>
            <div style={{ fontSize: 11, color: '#93c5fd' }}>السائق</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {driver.name[0]}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '0.5px solid #e0f2fe' }}>
        {[
          { key: 'pickup', label: 'استلام', count: toPickup.length, color: '#f59e0b' },
          { key: 'deliver', label: 'توصيل', count: toDeliver.length, color: '#22c55e' },
        ].map(tab => (
          <div key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ flex: 1, padding: '12px', textAlign: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: activeTab === tab.key ? '#0284c7' : '#94a3b8', borderBottom: activeTab === tab.key ? '2px solid #0284c7' : '2px solid transparent' }}>
            <span style={{ background: tab.color, color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, marginLeft: 6 }}>{tab.count}</span>
            {tab.label}
          </div>
        ))}
      </div>

      {/* الطلبات */}
      <div style={{ padding: 16 }}>
        {currentOrders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, border: '0.5px solid #e0f2fe', textAlign: 'center' }}>
            <i className={`ti ${activeTab === 'pickup' ? 'ti-package' : 'ti-truck'}`} style={{ fontSize: 40, color: '#bae6fd', display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, color: '#7dd3fc' }}>لا توجد طلبات {activeTab === 'pickup' ? 'للاستلام' : 'للتوصيل'}</div>
          </div>
        ) : currentOrders.map(order => (
          <div key={order.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '0.5px solid #e0f2fe', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(order.created_at).toLocaleDateString('ar-EG')}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>{order.customers?.name}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0284c7', marginBottom: 8 }}>
              <i className="ti ti-phone" style={{ fontSize: 15 }} />
              {order.customers?.phone}
            </div>

            {order.notes && (
              <div onClick={() => openMap(order.notes)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0c4a6e', background: '#f0f9ff', padding: '8px 10px', borderRadius: 8, marginBottom: 10, cursor: 'pointer', border: '0.5px solid #bae6fd' }}>
                <i className="ti ti-map-pin" style={{ fontSize: 15, color: '#0284c7' }} />
                <span style={{ flex: 1 }}>اضغط لفتح الموقع في خرائط جوجل</span>
                <i className="ti ti-external-link" style={{ fontSize: 14, color: '#0284c7' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {order.order_items?.map(item => (
                <span key={item.id} style={{ background: '#e0f2fe', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#0c4a6e', fontWeight: 700 }}>
                  {item.category_name} × {item.quantity}
                </span>
              ))}
            </div>

            {activeTab === 'deliver' && order.total_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>{order.total_amount} ج</div>
                <div style={{ fontSize: 12, color: '#166534' }}>المبلغ المطلوب</div>
              </div>
            )}

            <button onClick={() => handleAction(order)} disabled={loading}
              style={{ width: '100%', padding: 11, background: activeTab === 'pickup' ? '#f59e0b' : '#22c55e', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <i className={`ti ${activeTab === 'pickup' ? 'ti-package' : 'ti-check'}`} style={{ fontSize: 16 }} />
              {activeTab === 'pickup' ? 'استلمت من العميل' : 'وصّلت للعميل'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}