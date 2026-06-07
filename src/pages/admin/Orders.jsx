import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './Dashboard'

const statusLabels = { received: 'تم الاستلام', picked_up: 'تم الاستلام من العميل', washing: 'قيد الغسيل', ready: 'جاهز', delivering: 'في الطريق للتوصيل', delivered: 'تم التوصيل' }
const statusColors = { received: '#fef9c3', picked_up: '#fef9c3', washing: '#dbeafe', ready: '#dcfce7', delivering: '#fde8d8', delivered: '#f0fdf4' }
const statusTextColors = { received: '#854d0e', picked_up: '#854d0e', washing: '#1e40af', ready: '#166634', delivering: '#9a3412', delivered: '#166534' }
const statusSteps = ['received', 'picked_up', 'washing', 'ready', 'delivering', 'delivered']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [categories, setCategories] = useState([])
  const [newForm, setNewForm] = useState({ name: '', phone: '' })
  const [newItems, setNewItems] = useState({})
  const [saving, setSaving] = useState(false)
  const selectedRef = useRef(null)
  const savingRef = useRef(false)

  function updateSelected(order) {
    selectedRef.current = order
    setSelected(order)
  }

  useEffect(() => {
    fetchOrders()
    fetchCategories()

 const sub = supabase.channel('admin-orders')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
    if (!savingRef.current) {
      if (selectedRef.current && payload.new?.id === selectedRef.current?.id) {
        const updatedOrder = { ...selectedRef.current, status: payload.new.status }
        selectedRef.current = updatedOrder
        setSelected(updatedOrder)
      }
      fetchOrders()
    }
  })
  .subscribe()

return () => supabase.removeChannel(sub)
}, [])
 async function fetchOrders() {
  const { data } = await supabase
    .from('orders')
    .select('*, customers(name, phone), order_items(*)')
    .order('created_at', { ascending: false })
  setOrders(data || [])
}

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
    setCategories(data || [])
  }

 async function updateStatus(orderId, newStatus) {
  if (newStatus === 'ready') {
    const hasItems = selectedRef.current?.order_items?.length > 0
    const allPriced = hasItems && selectedRef.current?.order_items?.every(item => {
      const priceInState = prices[item.id]
      return (priceInState && parseFloat(priceInState) > 0) || item.price > 0
    })
    if (hasItems && !allPriced) {
      alert('يجب تحديد أسعار جميع الأصناف أولاً قبل الانتقال لمرحلة جاهز')
      return
    }
  }
  setLoading(true)
  await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  
  const updatedOrder = { ...selectedRef.current, status: newStatus }
  selectedRef.current = updatedOrder
  setSelected(updatedOrder)
  setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  
  setLoading(false)
}
 async function savePrices() {
  if (!selectedRef.current) return
  savingRef.current = true
  setSaving(true)

  for (const [itemId, price] of Object.entries(prices)) {
    await supabase.from('order_items').update({ price: parseFloat(price) || 0 }).eq('id', itemId)
  }

  const total = Object.values(prices).reduce((a, b) => a + (parseFloat(b) || 0), 0)
  await supabase.from('orders').update({ total_amount: total }).eq('id', selectedRef.current.id)

  const updatedItems = selectedRef.current.order_items.map(item => ({
    ...item,
    price: parseFloat(prices[item.id]) || item.price
  }))

  const updatedOrder = {
    ...selectedRef.current,
    total_amount: total,
    order_items: updatedItems
  }

  selectedRef.current = updatedOrder
  setSelected(updatedOrder)
  setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))

  savingRef.current = false
  setSaving(false)
  setSaveMsg('تم حفظ الأسعار ✅')
  setTimeout(() => setSaveMsg(''), 3000)
}

  async function handleNewOrder() {
    if (!newForm.name || !newForm.phone) { alert('أدخل اسم العميل ورقم التليفون'); return }
    if (Object.values(newItems).reduce((a, b) => a + b, 0) === 0) { alert('أضف صنف واحد على الأقل'); return }
    savingRef.current = true
    setSaving(true)

    let { data: customer } = await supabase.from('customers').select('id').eq('phone', newForm.phone).single()
    if (!customer) {
      const { data: nc } = await supabase.from('customers').insert({ name: newForm.name, phone: newForm.phone }).select().single()
      customer = nc
    }

    const { data: order } = await supabase.from('orders')
      .insert({ customer_id: customer.id, type: 'walkin', status: 'received' })
      .select().single()

    const items = Object.entries(newItems).map(([catId, qty]) => ({
      order_id: order.id,
      category_id: catId,
      category_name: categories.find(c => c.id === catId)?.name,
      quantity: qty,
      price: 0,
    }))
    await supabase.from('order_items').insert(items)
    savingRef.current = false
    setSaving(false)
    await fetchOrders()
    setShowNewOrder(false)
    setNewForm({ name: '', phone: '' })
    setNewItems({})
  }

  function updateNewItem(id, delta) {
    setNewItems(prev => {
      const val = (prev[id] || 0) + delta
      if (val <= 0) { const next = { ...prev }; delete next[id]; return next }
      return { ...prev, [id]: val }
    })
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: "'Almarai', sans-serif", textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 12 }

  return (
    <AdminLayout currentPath="/admin/orders">
      <div style={{ display: 'flex', gap: 20 }}>

        <div style={{ flex: selected ? '0 0 420px' : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>الطلبات</div>
            <button onClick={() => setShowNewOrder(true)}
              style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-plus" style={{ fontSize: 16 }} />
              طلب جديد
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[{ key: 'all', label: 'الكل' }, ...statusSteps.map(s => ({ key: s, label: statusLabels[s] }))].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer', background: filter === f.key ? '#0284c7' : '#fff', color: filter === f.key ? '#fff' : '#7dd3fc', border: filter === f.key ? 'none' : '1px solid #bae6fd' }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(order => (
              <div key={order.id}
                onClick={() => { updateSelected(order); setPrices(Object.fromEntries((order.order_items || []).map(i => [i.id, i.price || '']))) }}
                style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: selected?.id === order.id ? '2px solid #0284c7' : '0.5px solid #e0f2fe', cursor: 'pointer' }}
                onMouseEnter={e => { if (selected?.id !== order.id) e.currentTarget.style.background = '#f0f9ff' }}
                onMouseLeave={e => { if (selected?.id !== order.id) e.currentTarget.style.background = '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ background: statusColors[order.status], color: statusTextColors[order.status], borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                    {statusLabels[order.status]}
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>{order.customers?.name}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7dd3fc' }}>
                  <span>{order.total_amount ? `${order.total_amount} ج` : 'لم يحدد السعر'}</span>
                  <span>{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: '#7dd3fc', padding: 40, fontSize: 14 }}>لا توجد طلبات</div>
            )}
          </div>
        </div>

        {selected && (
          <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: 20, border: '0.5px solid #e0f2fe', alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={() => { updateSelected(null); selectedRef.current = null }} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#0284c7', cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}>
                إغلاق
              </button>
              <button onClick={async () => {
  const { data } = await supabase
    .from('orders')
    .select('*, customers(name, phone), order_items(*)')
    .eq('id', selected.id)
    .single()
  if (data) {
    selectedRef.current = data
    setSelected(data)
    setPrices(Object.fromEntries((data.order_items || []).map(i => [i.id, i.price || ''])))
  }
}} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#0284c7', cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}>
  🔄 تحديث
</button>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>تفاصيل الطلب</div>
            </div>

            <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#7dd3fc', marginBottom: 6 }}>بيانات العميل</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e', marginBottom: 4 }}>{selected.customers?.name}</div>
              <div style={{ fontSize: 13, color: '#0284c7' }}>{selected.customers?.phone}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 10 }}>الحالة الحالية</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ background: statusColors[selected.status], color: statusTextColors[selected.status], borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
                  {statusLabels[selected.status]}
                </span>
                {statusSteps.indexOf(selected.status) < statusSteps.length - 1 && (
                  <button
                    onClick={() => updateStatus(selected.id, statusSteps[statusSteps.indexOf(selected.status) + 1])}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer' }}>
                    <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
                    {statusLabels[statusSteps[statusSteps.indexOf(selected.status) + 1]]}
                  </button>
                )}
                {statusSteps.indexOf(selected.status) === statusSteps.length - 1 && (
                  <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>✅ مكتمل</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 10 }}>
                {selected.status === 'washing' ? 'تحديد الأسعار' : 'الأصناف'}
              </div>
              {(selected.order_items || []).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #f0f9ff' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>{item.category_name}</div>
                    <div style={{ fontSize: 12, color: '#7dd3fc' }}>الكمية: {item.quantity}</div>
                  </div>
                  {selected.status === 'washing' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        value={prices[item.id] || ''}
                        onChange={e => setPrices(p => ({ ...p, [item.id]: e.target.value }))}
                        placeholder="السعر"
                        style={{ width: 90, padding: '7px 10px', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 13, fontFamily: "'Almarai', sans-serif", textAlign: 'center', background: '#f0f9ff', color: '#0c4a6e', outline: 'none' }}
                      />
                      <span style={{ fontSize: 12, color: '#7dd3fc' }}>ج</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>
                      {item.price ? `${item.price} ج` : '-'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selected.status === 'washing' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e0f2fe', marginBottom: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0284c7' }}>
                    {Object.values(prices).reduce((a, b) => a + (parseFloat(b) || 0), 0)} ج
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>الإجمالي</div>
                </div>
                <button onClick={savePrices} disabled={saving}
                  style={{ width: '100%', padding: 12, background: saving ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer' }}>
                  {saving ? 'جاري الحفظ...' : 'حفظ الأسعار'}
                </button>
                {saveMsg && (
                  <div style={{ marginTop: 10, background: '#dcfce7', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#166534', textAlign: 'center', fontWeight: 700 }}>
                    {saveMsg}
                  </div>
                )}
              </div>
            )}

            {selected.total_amount > 0 && selected.status !== 'washing' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e0f2fe' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0284c7' }}>{selected.total_amount} ج</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>الإجمالي</div>
              </div>
            )}
          </div>
        )}
      </div>

      {showNewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={() => setShowNewOrder(false)} style={{ background: '#f0f9ff', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: 16, color: '#0284c7' }} />
              </button>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>طلب جديد (يدوي)</div>
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>اسم العميل</label>
            <input style={inputStyle} placeholder="الاسم الكامل" value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>رقم التليفون</label>
            <input style={inputStyle} placeholder="01xxxxxxxxx" type="tel" value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} />

            <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 12 }}>الأصناف</div>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #f0f9ff' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>{cat.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => updateNewItem(cat.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0284c7', fontSize: 16, cursor: 'pointer' }}>−</button>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e', minWidth: 20, textAlign: 'center' }}>{newItems[cat.id] || 0}</span>
                  <button onClick={() => updateNewItem(cat.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#0284c7', color: '#fff', fontSize: 16, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}

            <button onClick={handleNewOrder} disabled={saving}
              style={{ width: '100%', padding: 13, background: saving ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer', marginTop: 20 }}>
              {saving ? 'جاري الحفظ...' : 'إضافة الطلب'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}