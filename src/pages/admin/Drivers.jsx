import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './Dashboard'

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', password: '1234' })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchDrivers() }, [])

 async function fetchDrivers() {
  const { data } = await supabase.from('drivers').select('*')
  setDrivers(data || [])
}

  async function handleSave() {
  if (!form.name || !form.phone) { alert('أدخل الاسم ورقم التليفون'); return }
  setSaving(true)
  if (editId) {
    await supabase.from('drivers').update({ name: form.name, phone: form.phone, password: form.password }).eq('id', editId)
  } else {
    await supabase.from('drivers').insert({ name: form.name, phone: form.phone, password: form.password, is_active: true })
  }
  await fetchDrivers()
  setShowForm(false)
  setForm({ name: '', phone: '', password: '1234' })
  setEditId(null)
  setSaving(false)
}

  async function toggleActive(driver) {
    await supabase.from('drivers').update({ is_active: !driver.is_active }).eq('id', driver.id)
    await fetchDrivers()
  }

  async function handleDelete(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await supabase.from('drivers').delete().eq('id', id)
    await fetchDrivers()
  }

  function startEdit(driver) {
    setForm({ name: driver.name, phone: driver.phone, password: driver.password || '1234' })
    setEditId(driver.id)
    setShowForm(true)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: 'Almarai, sans-serif', textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 12 }

  return (
    <AdminLayout currentPath="/admin/drivers">
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />

      <div style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>السائقين</div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', phone: '', password: '1234' }) }}
            style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'Almarai, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-plus" style={{ fontSize: 16 }} />
            سائق جديد
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {drivers.map(driver => {
            const totalOrders = driver.orders?.length || 0
            const activeOrders = driver.orders?.filter(o => !['delivered', 'received'].includes(o.status)).length || 0
            return (
              <div key={driver.id} style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '0.5px solid #e0f2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toggleActive(driver)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${driver.is_active ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15, color: '#0284c7' }} />
                    </button>
                    <button onClick={() => startEdit(driver)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-edit" style={{ fontSize: 15, color: '#0284c7' }} />
                    </button>
                    <button onClick={() => handleDelete(driver.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-trash" style={{ fontSize: 15, color: '#dc2626' }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, background: driver.is_active ? '#dcfce7' : '#f1f5f9', color: driver.is_active ? '#166534' : '#64748b', borderRadius: 20, padding: '2px 8px' }}>
                      {driver.is_active ? 'نشط' : 'متوقف'}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>{driver.name}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#0c4a6e' }}>{totalOrders}</div>
                      <div style={{ fontSize: 11, color: '#7dd3fc' }}>إجمالي الطلبات</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{activeOrders}</div>
                      <div style={{ fontSize: 11, color: '#7dd3fc' }}>طلبات نشطة</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#0284c7' }}>{driver.phone}</div>
                </div>
              </div>
            )
          })}
          {drivers.length === 0 && (
            <div style={{ textAlign: 'center', color: '#7dd3fc', padding: 40, fontSize: 14 }}>لا يوجد سائقين</div>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ background: '#f0f9ff', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: 16, color: '#0284c7' }} />
              </button>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>{editId ? 'تعديل السائق' : 'سائق جديد'}</div>
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>الاسم</label>
            <input style={inputStyle} placeholder="اسم السائق" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>رقم التليفون</label>
            <input style={inputStyle} placeholder="01xxxxxxxxx" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>كلمة السر</label>
            <input style={inputStyle} placeholder="كلمة السر" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />

            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: 13, background: saving ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: 'Almarai, sans-serif', cursor: 'pointer' }}>
              {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة السائق'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}