import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { supabase } from '../../lib/supabase'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]) },
  })
  return position ? <Marker position={position} /> : null
}

function LocateMe({ setPosition }) {
  const map = useMapEvents({})

  function locate() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition([latitude, longitude])
        map.flyTo([latitude, longitude], 17)
      },
      () => alert('تعذر تحديد موقعك، تأكد من السماح بالوصول للموقع')
    )
  }

  return (
    <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000 }}>
      <button onClick={locate} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-current-location" style={{ fontSize: 16 }} />
        موقعك الحالي
      </button>
    </div>
  )
}

export default function NewOrder() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState({})
  const [form, setForm] = useState({ name: '', phone: '' })
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data || []))
  }, [])

  function updateItem(id, delta) {
    setItems(prev => {
      const val = (prev[id] || 0) + delta
      if (val <= 0) { const next = { ...prev }; delete next[id]; return next }
      return { ...prev, [id]: val }
    })
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) { setError('أدخل الاسم ورقم التليفون'); return }
    if (!position) { setError('حدد موقعك على الخريطة'); return }
    if (Object.values(items).reduce((a, b) => a + b, 0) === 0) { setError('أضف صنف واحد على الأقل'); return }

    setLoading(true)
    setError('')

    let { data: customer } = await supabase.from('customers').select('id').eq('phone', form.phone).single()

    if (!customer) {
      const { data: newCustomer } = await supabase.from('customers')
        .insert({ name: form.name, phone: form.phone, address: `${position[0]},${position[1]}` })
        .select().single()
      customer = newCustomer
    }

    const { data: order } = await supabase.from('orders')
      .insert({ customer_id: customer.id, type: 'pickup', status: 'received', notes: `${position[0].toFixed(5)},${position[1].toFixed(5)}` })
      .select().single()

    const orderItems = Object.entries(items).map(([catId, qty]) => ({
      order_id: order.id,
      category_id: catId,
      category_name: categories.find(c => c.id === catId)?.name,
      quantity: qty,
      price: 0,
    }))

    await supabase.from('order_items').insert(orderItems)
    setLoading(false)
    navigate('/track', { state: { phone: form.phone } })
  }

  const card = { background: '#fff', borderRadius: 16, padding: 18, border: '0.5px solid #e0f2fe', marginBottom: 14 }
  const sectionLabel = { fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: "'Almarai', sans-serif", textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 10 }

  return (
    <div style={{ fontFamily: "'Almarai', sans-serif", direction: 'rtl', background: '#f0f9ff', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: '#0c4a6e', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 999 }}>
        <button onClick={() => navigate('/')} style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>طلب جديد</div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', paddingBottom: 90 }}>

        {/* بيانات */}
        <div style={card}>
          <div style={sectionLabel}>
            <i className="ti ti-user" style={{ fontSize: 16, color: '#0284c7' }} />
            بياناتك
          </div>
          <input style={inputStyle} placeholder="الاسم الكامل" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="رقم التليفون" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>

        {/* الخريطة */}
        <div style={card}>
          <div style={sectionLabel}>
            <i className="ti ti-map-pin" style={{ fontSize: 16, color: '#0284c7' }} />
            موقعك
          </div>
          {position && (
            <div style={{ background: '#e0f2fe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#0c4a6e', marginBottom: 10 }}>
              ✅ تم تحديد الموقع
            </div>
          )}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #bae6fd', height: 220, position: 'relative' }}>
            <MapContainer center={[30.5877, 31.5017]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker position={position} setPosition={setPosition} />
              <LocateMe setPosition={setPosition} />
            </MapContainer>
          </div>
          <div style={{ fontSize: 11, color: '#7dd3fc', marginTop: 8, textAlign: 'center' }}>اضغط على الخريطة لتحديد موقعك</div>
        </div>

        {/* الأصناف */}
        <div style={card}>
          <div style={sectionLabel}>
            <i className="ti ti-list" style={{ fontSize: 16, color: '#0284c7' }} />
            الأصناف
          </div>
          {categories.map((cat, i) => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < categories.length - 1 ? '0.5px solid #f0f9ff' : 'none' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>{cat.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => updateItem(cat.id, -1)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0284c7', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e', minWidth: 20, textAlign: 'center' }}>{items[cat.id] || 0}</span>
                <button onClick={() => updateItem(cat.id, 1)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#0284c7', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ color: 'red', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{error}</div>}
      </div>

      {/* زر الإرسال */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '14px 20px', background: '#fff', borderTop: '0.5px solid #e0f2fe', zIndex: 999 }}>
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 14, background: loading ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer' }}>
          {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
        </button>
      </div>
    </div>
  )
}