import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './Dashboard'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', sort_order: 0 })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
  }

  async function handleSave() {
    if (!form.name) { alert('أدخل اسم الصنف'); return }
    setSaving(true)
    if (editId) {
      await supabase.from('categories').update({ name: form.name, sort_order: parseInt(form.sort_order) }).eq('id', editId)
    } else {
      await supabase.from('categories').insert({ name: form.name, sort_order: parseInt(form.sort_order), is_active: true })
    }
    await fetchCategories()
    setShowForm(false)
    setForm({ name: '', sort_order: 0 })
    setEditId(null)
    setSaving(false)
  }

  async function toggleActive(cat) {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    await fetchCategories()
  }

  async function handleDelete(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await supabase.from('categories').delete().eq('id', id)
    await fetchCategories()
  }

  function startEdit(cat) {
    setForm({ name: cat.name, sort_order: cat.sort_order })
    setEditId(cat.id)
    setShowForm(true)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: "'Almarai', sans-serif", textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 12 }

  return (
    
    <AdminLayout currentPath="/admin/categories">
        <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />
      <div style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>الأصناف</div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', sort_order: categories.length + 1 }) }}
            style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-plus" style={{ fontSize: 16 }} />
            صنف جديد
          </button>
        </div>

        {/* قائمة الأصناف */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '0.5px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: cat.is_active ? '#0c4a6e' : '#94a3b8' }}>{cat.name}</div>
                <div style={{ fontSize: 11, background: cat.is_active ? '#dcfce7' : '#f1f5f9', color: cat.is_active ? '#166534' : '#64748b', borderRadius: 20, padding: '2px 8px' }}>
                  {cat.is_active ? 'نشط' : 'متوقف'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleActive(cat)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${cat.is_active ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15, color: '#0284c7' }} />
                </button>
                <button onClick={() => startEdit(cat)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-edit" style={{ fontSize: 15, color: '#0284c7' }} />
                </button>
                <button onClick={() => handleDelete(cat.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-trash" style={{ fontSize: 15, color: '#dc2626' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مودال الإضافة/التعديل */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ background: '#f0f9ff', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: 16, color: '#0284c7' }} />
              </button>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>{editId ? 'تعديل الصنف' : 'صنف جديد'}</div>
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>اسم الصنف</label>
            <input style={inputStyle} placeholder="مثال: سجاد، لحاف..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>الترتيب</label>
            <input style={inputStyle} type="number" placeholder="1" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} />

            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: 13, background: saving ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "'Almarai', sans-serif", cursor: 'pointer' }}>
              {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة الصنف'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}