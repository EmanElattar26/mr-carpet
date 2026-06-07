import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
const statusSteps = ['received', 'picked_up', 'washing', 'ready', 'delivering', 'delivered']
const statusLabels = {
  received: 'تم الاستلام',
  picked_up: 'في الطريق للغسيل',
  washing: 'قيد الغسيل',
  ready: 'جاهز',
  delivering: 'في الطريق للتوصيل',
  delivered: 'تم التوصيل',
}
const statusIcons = {
  received: 'ti-package',
  picked_up: 'ti-truck',
  washing: 'ti-droplet',
  ready: 'ti-check',
  delivering: 'ti-truck',
  delivered: 'ti-circle-check',
}

export default function TrackOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState(location.state?.phone || '')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (location.state?.phone) handleSearch(location.state.phone)
  }, [])

  async function handleSearch(p) {
    const searchPhone = p || phone
    if (!searchPhone) return
    setLoading(true)
    setError('')
    setOrders([])
    setSearched(true)

    const { data: customer } = await supabase
      .from('customers')
      .select('id, name')
      .eq('phone', searchPhone)
      .single()

    if (!customer) {
      setError('لم يتم العثور على طلبات بهذا الرقم')
      setLoading(false)
      return
    }

   const { data } = await supabase
  .from('orders')
  .select('*, order_items(*), customers(name)')
  .eq('customer_id', customer.id)
  .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Almarai', sans-serif", direction: 'rtl', background: '#f0f9ff', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: '#0c4a6e', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 999 }}>
        <button onClick={() => navigate('/')} style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>تتبع طلبك</div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* البحث */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '0.5px solid #e0f2fe', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 4 }}>رقم التليفون</div>
          <div style={{ fontSize: 12, color: '#7dd3fc', marginBottom: 12 }}>أدخل رقم تليفونك لمعرفة حالة طلباتك</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="01xxxxxxxxx"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: "'Almarai', sans-serif", textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none' }}
            />
            <button onClick={() => handleSearch()} style={{ padding: '11px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer' }}>
              بحث
            </button>
          </div>
          {error && <div style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{error}</div>}
        </div>

        {/* loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#7dd3fc', padding: 40 }}>
            <i className="ti ti-loader" style={{ fontSize: 32 }} />
            <div style={{ marginTop: 8, fontSize: 14 }}>جاري البحث...</div>
          </div>
        )}

        {/* لا توجد طلبات */}
        {searched && !loading && orders.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: '#7dd3fc', padding: 40 }}>
            <i className="ti ti-inbox" style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>لا توجد طلبات</div>
          </div>
        )}

        {/* الطلبات */}
        {orders.map(order => {
          const currentIndex = statusSteps.indexOf(order.status)
          return (
            <div key={order.id} style={{ background: '#fff', borderRadius: 16, padding: 18, border: '0.5px solid #e0f2fe', marginBottom: 14 }}>

              {/* رقم الطلب والتاريخ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#7dd3fc' }}>
                  {new Date(order.created_at).toLocaleDateString('ar-EG')}
                </div>
               <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>
  {order.customers?.name || 'طلب جديد'}
</div>
              </div>

              {/* شريط الحالة */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                {statusSteps.map((step, i) => {
                  const isDone = i <= currentIndex
                  return (
                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      {i < statusSteps.length - 1 && (
<div style={{ position: 'absolute', top: 14, left: '-50%', width: '100%', height: 2, background: i < currentIndex ? '#0284c7' : '#e0f2fe', zIndex: 0 }} />                      )}
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDone ? '#0284c7' : '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, marginBottom: 6 }}>
                        <i className={`ti ${statusIcons[step]}`} style={{ fontSize: 14, color: isDone ? '#fff' : '#7dd3fc' }} />
                      </div>
                      <div style={{ fontSize: 10, color: isDone ? '#0c4a6e' : '#aaa', fontWeight: isDone ? 700 : 400, textAlign: 'center' }}>
                        {statusLabels[step]}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* الأصناف */}
              {order.order_items?.length > 0 && (
                <div style={{ borderTop: '0.5px solid #e0f2fe', paddingTop: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#7dd3fc', marginBottom: 8 }}>الأصناف</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {order.order_items.map(item => (
                      <div key={item.id} style={{ background: '#e0f2fe', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#0c4a6e', fontWeight: 700 }}>
                        {item.category_name} × {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* النوع */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: order.status === 'delivered' ? '#dcfce7' : '#fef9c3', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: order.status === 'delivered' ? '#166534' : '#854d0e', fontWeight: 700 }}>
                  {statusLabels[order.status]}
                </div>
                <div style={{ fontSize: 12, color: '#7dd3fc' }}>
                  {order.type === 'pickup' ? 'استلام وتوصيل' : 'زيارة للمغسلة'}
                </div>
              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}