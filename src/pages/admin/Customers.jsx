import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './Dashboard'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [orders, setOrders] = useState([])
const [checkedIds, setCheckedIds] = useState([])

  useEffect(() => { fetchCustomers() }, [])

  async function fetchCustomers() {
    const { data } = await supabase
      .from('customers')
      .select('*, orders(id, status, total_amount, created_at)')
      .order('created_at', { ascending: false })
    setCustomers(data || [])
  }

  async function fetchCustomerOrders(customerId) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  function selectCustomer(customer) {
    setSelected(customer)
    fetchCustomerOrders(customer.id)
  }

  const statusLabels = { received: 'تم الاستلام', picked_up: 'تم الاستلام من العميل', washing: 'قيد الغسيل', ready: 'جاهز', delivering: 'في الطريق للتوصيل', delivered: 'تم التوصيل' }
  const statusColors = { received: '#fef9c3', picked_up: '#fef9c3', washing: '#dbeafe', ready: '#dcfce7', delivering: '#fde8d8', delivered: '#f0fdf4' }
  const statusTextColors = { received: '#854d0e', picked_up: '#854d0e', washing: '#1e40af', ready: '#166534', delivering: '#9a3412', delivered: '#166534' }

  const filtered = customers.filter(c =>
    c.name?.includes(search) || c.phone?.includes(search)
  )

  return (
    <AdminLayout currentPath="/admin/customers">
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />

      <div style={{ display: 'flex', gap: 20 }}>

        <div style={{ flex: selected ? '0 0 380px' : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>العملاء ({filtered.length})</div>
   {checkedIds.length > 0 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ padding: '4px 10px', background: '#dcfce7', borderRadius: 20, fontSize: 12, color: '#166534', fontWeight: 700 }}>
      {checkedIds.length} محدد
    </span>
    <button
      onClick={() => {
        const selectedCustomers = customers.filter(c => checkedIds.includes(c.id))
        selectedCustomers.forEach((c, i) => {
          setTimeout(() => {
            window.open(`https://wa.me/2${c.phone}?text=${encodeURIComponent('مرحباً ' + c.name + '، نتواصل معك من مغسلة Mr Carpet')}`, '_blank')
          }, i * 1000)
        })
      }}
      style={{ padding: '6px 14px', background: '#25D366', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Almarai, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
      <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} />
      إرسال للمحددين
    </button>
  </div>
)}
  </div>
  <button onClick={() => setCheckedIds(checkedIds.length === filtered.length ? [] : filtered.map(c => c.id))}
    style={{ padding: '6px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#0284c7', cursor: 'pointer', fontFamily: 'Almarai, sans-serif' }}>
    {checkedIds.length === filtered.length && filtered.length > 0 ? 'إلغاء التحديد' : 'تحديد الكل'}
  </button>
</div>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              placeholder="ابحث بالاسم أو التليفون..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: 'Almarai, sans-serif', textAlign: 'right', background: '#fff', color: '#0c4a6e', outline: 'none' }}
            />
            <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#7dd3fc' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(customer => {
              const totalOrders = customer.orders?.length || 0
              const totalSpent = customer.orders?.reduce((a, b) => a + (b.total_amount || 0), 0) || 0
              return (
           <div key={customer.id}
  style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: selected?.id === customer.id ? '2px solid #0284c7' : '0.5px solid #e0f2fe', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => { if (selected?.id !== customer.id) e.currentTarget.style.background = '#f0f9ff' }}
                  onMouseLeave={e => { if (selected?.id !== customer.id) e.currentTarget.style.background = '#fff' }}>
                    <input
  type="checkbox"
  checked={checkedIds.includes(customer.id)}
  onChange={e => {
    e.stopPropagation()
    setCheckedIds(prev => prev.includes(customer.id) ? prev.filter(id => id !== customer.id) : [...prev, customer.id])
  }}
  style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
/>
<div style={{ flex: 1 }} onClick={() => selectCustomer(customer)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: '#7dd3fc' }}>{customer.phone}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>{customer.name}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#0284c7', fontWeight: 700 }}>{totalSpent} ج</span>
                    <span style={{ color: '#7dd3fc' }}>{totalOrders} طلب</span>
                  </div>
                </div>
                  </div>
              )

            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: '#7dd3fc', padding: 40, fontSize: 14 }}>لا يوجد عملاء</div>
            )}
          </div>
        </div>

        {selected && (
          <div style={{ flex: 1 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '0.5px solid #e0f2fe', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button onClick={() => setSelected(null)} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#0284c7', cursor: 'pointer', fontFamily: 'Almarai, sans-serif' }}>
                  إغلاق
                </button>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>{selected.name}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0c4a6e' }}>{orders.length}</div>
                  <div style={{ fontSize: 12, color: '#7dd3fc' }}>إجمالي الطلبات</div>
                </div>
                <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0c4a6e' }}>{orders.filter(o => o.status === 'delivered').length}</div>
                  <div style={{ fontSize: 12, color: '#7dd3fc' }}>طلبات مكتملة</div>
                </div>
                <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0284c7' }}>{orders.reduce((a, b) => a + (b.total_amount || 0), 0)} ج</div>
                  <div style={{ fontSize: 12, color: '#7dd3fc' }}>إجمالي المدفوع</div>
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '10px 14px', background: '#f0f9ff', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-phone" style={{ fontSize: 16, color: '#0284c7' }} />
                  <span style={{ fontSize: 13, color: '#0c4a6e' }}>{selected.phone}</span>
                </div>
                
                <a href={`https://wa.me/2${selected.phone}?text=${encodeURIComponent('مرحباً ' + selected.name + '، نتواصل معك من مغسلة Mr Carpet')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: '10px 16px', background: '#25D366', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Almarai, sans-serif' }}>
                  <i className="ti ti-brand-whatsapp" style={{ fontSize: 18 }} />
                  واتساب
                </a>
              </div>

              {selected.address && (
                <div style={{ marginTop: 8, padding: '10px 14px', background: '#f0f9ff', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-map-pin" style={{ fontSize: 16, color: '#0284c7' }} />
                  <span style={{ fontSize: 13, color: '#0c4a6e' }}>{selected.address}</span>
                </div>
              )}
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e', marginBottom: 12 }}>طلبات العميل</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '0.5px solid #e0f2fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ background: statusColors[order.status], color: statusTextColors[order.status], borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                      {statusLabels[order.status]}
                    </span>
                    <div style={{ fontSize: 12, color: '#7dd3fc' }}>{new Date(order.created_at).toLocaleDateString('ar-EG')}</div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {order.order_items?.map(item => (
                      <span key={item.id} style={{ background: '#e0f2fe', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#0c4a6e', fontWeight: 700 }}>
                        {item.category_name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7' }}>
                    {order.total_amount ? `${order.total_amount} ج` : 'لم يحدد السعر'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}