import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const menuItems = [
  { icon: 'ti-layout-dashboard', label: 'الرئيسية', path: '/admin' },
  { icon: 'ti-clipboard-list', label: 'الطلبات', path: '/admin/orders' },
  { icon: 'ti-users', label: 'العملاء', path: '/admin/customers' },
  { icon: 'ti-message', label: 'الرسائل', path: '/admin/messages' },
  { icon: 'ti-category', label: 'الأصناف', path: '/admin/categories' },
  { icon: 'ti-truck', label: 'السائقين', path: '/admin/drivers' },
  { icon: 'ti-chart-bar', label: 'التقارير', path: '/admin/reports' },
  { icon: 'ti-shield-lock', label: 'المستخدمين', path: '/admin/users' },
]

export function AdminLayout({ children, currentPath }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('mr_carpet_user') || '{}')
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    if (!user.id) { navigate('/admin/login'); return }
    fetchNotifications()

    const orderSub = supabase.channel('new-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        setNotifications(prev => [{
          id: payload.new.id,
          type: 'order',
          text: 'طلب جديد وصل',
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          read: false,
        }, ...prev].slice(0, 10))
      })
      .subscribe()

    const msgSub = supabase.channel('new-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setNotifications(prev => [{
          id: payload.new.id,
          type: 'message',
          text: 'رسالة جديدة من عميل',
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          read: false,
        }, ...prev].slice(0, 10))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(orderSub)
      supabase.removeChannel(msgSub)
    }
  }, [])

  async function fetchNotifications() {
    const { data: orders } = await supabase.from('orders').select('id, created_at').order('created_at', { ascending: false }).limit(3)
    const { data: msgs } = await supabase.from('messages').select('id, created_at, is_read').order('created_at', { ascending: false }).limit(3)

    const all = [
      ...(orders || []).map(o => ({ id: o.id, type: 'order', text: 'طلب جديد وصل', time: new Date(o.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), read: true })),
      ...(msgs || []).map(m => ({ id: m.id, type: 'message', text: 'رسالة جديدة من عميل', time: new Date(m.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), read: m.is_read })),
    ].slice(0, 8)

    setNotifications(all)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ fontFamily: "'Almarai', sans-serif", direction: 'rtl', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: '#0c4a6e', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Mr <span style={{ color: '#7dd3fc' }}>Carpet</span></div>
          <div style={{ fontSize: 11, color: '#93c5fd', background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20 }}>لوحة التحكم</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* الإشعارات */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotif(!showNotif); setNotifications(prev => prev.map(n => ({ ...n, read: true }))) }}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <i className="ti ti-bell" style={{ fontSize: 18 }} />
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, background: '#f87171', borderRadius: '50%' }} />
              )}
            </button>

            {showNotif && (
              <div style={{ position: 'absolute', top: 46, left: 0, width: 290, background: '#fff', borderRadius: 14, border: '0.5px solid #e0f2fe', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e0f2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>الإشعارات</div>
                  {unreadCount > 0 && <div style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 20 }}>{unreadCount} جديد</div>}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#7dd3fc', fontSize: 13 }}>لا توجد إشعارات</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i}
                      onClick={() => { setShowNotif(false); navigate(n.type === 'order' ? '/admin/orders' : '/admin/messages') }}
                      style={{ padding: '12px 16px', borderBottom: '0.5px solid #f0f9ff', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: n.read ? '#fff' : '#f0f9ff' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? '#fff' : '#f0f9ff'}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: n.type === 'order' ? '#dbeafe' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`ti ${n.type === 'order' ? 'ti-clipboard-list' : 'ti-message'}`} style={{ fontSize: 17, color: n.type === 'order' ? '#1e40af' : '#166534' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e' }}>{n.text}</div>
                        <div style={{ fontSize: 11, color: '#7dd3fc', marginTop: 2 }}>{n.time}</div>
                      </div>
                      {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ fontSize: 13, color: '#93c5fd' }}>{user.name}</div>
          <button onClick={() => { localStorage.removeItem('mr_carpet_user'); navigate('/admin/login') }}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}>
            خروج
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <div style={{ width: 200, background: '#0c4a6e', flexShrink: 0, paddingTop: 12 }}>
          {menuItems.filter(item => {
  if (item.path === '/admin') return true
  if (user.role === 'admin') return true
  const pageKey = item.path.replace('/admin/', '')
  return user.permissions?.includes(pageKey)
}).map(item => {
            const active = currentPath === item.path
            return (
              <div key={item.path} onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', cursor: 'pointer', background: active ? 'rgba(255,255,255,0.1)' : 'transparent', borderRight: active ? '3px solid #7dd3fc' : '3px solid transparent', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 17, color: active ? '#7dd3fc' : 'rgba(255,255,255,0.5)' }} />
                <span style={{ fontSize: 13, color: active ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: active ? 700 : 400 }}>{item.label}</span>
              </div>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: '#f0f9ff', padding: 24, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0]
    const { data: orders } = await supabase.from('orders').select('*, customers(name)').order('created_at', { ascending: false })
    if (!orders) return
    const todayOrders = orders.filter(o => o.created_at.startsWith(today))
    const pending = orders.filter(o => o.status !== 'delivered')
    const revenue = orders.filter(o => o.status === 'delivered').reduce((a, b) => a + (b.total_amount || 0), 0)
    setStats({ total: orders.length, today: todayOrders.length, pending: pending.length, revenue })
    setRecentOrders(orders.slice(0, 5))
  }

  const statusColors = { received: '#fef9c3', washing: '#dbeafe', ready: '#dcfce7', delivered: '#f0fdf4' }
  const statusTextColors = { received: '#854d0e', washing: '#1e40af', ready: '#166534', delivered: '#166534' }
  const statusLabels = { received: 'تم الاستلام', washing: 'قيد الغسيل', ready: 'جاهز', delivered: 'تم التوصيل' }

  return (
    <AdminLayout currentPath="/admin">
        <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0c4a6e', marginBottom: 20 }}>مرحباً 👋</div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'إجمالي الطلبات', value: stats.total, icon: 'ti-clipboard-list', bg: '#dbeafe', color: '#1e40af' },
          { label: 'طلبات اليوم', value: stats.today, icon: 'ti-calendar', bg: '#dcfce7', color: '#166534' },
          { label: 'طلبات معلقة', value: stats.pending, icon: 'ti-clock', bg: '#fef9c3', color: '#854d0e' },
          { label: 'الإيرادات', value: `${stats.revenue} ج`, icon: 'ti-coin', bg: '#f0fdf4', color: '#166534' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '0.5px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 22, color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0c4a6e' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#7dd3fc' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* آخر الطلبات */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '0.5px solid #e0f2fe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>آخر الطلبات</div>
          <button onClick={() => navigate('/admin/orders')}
            style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#0284c7', cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}>
            عرض الكل
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0f2fe' }}>
                {['العميل', 'النوع', 'الحالة', 'التاريخ', 'المبلغ'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', color: '#7dd3fc', fontWeight: 700, textAlign: 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}
                  onClick={() => navigate('/admin/orders')}
                  style={{ borderBottom: '0.5px solid #f0f9ff', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px', color: '#0c4a6e', fontWeight: 700 }}>{order.customers?.name || '-'}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{order.type === 'pickup' ? 'استلام وتوصيل' : 'زيارة'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: statusColors[order.status], color: statusTextColors[order.status], borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                  <td style={{ padding: '12px', color: '#0c4a6e', fontWeight: 700 }}>{order.total_amount ? `${order.total_amount} ج` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
    
  )
}