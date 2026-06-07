import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './Dashboard'

const allPages = [
  { key: 'orders', label: 'الطلبات', icon: 'ti-clipboard-list' },
  { key: 'customers', label: 'العملاء', icon: 'ti-users' },
  { key: 'messages', label: 'الرسائل', icon: 'ti-message' },
  { key: 'categories', label: 'الأصناف', icon: 'ti-category' },
  { key: 'drivers', label: 'السائقين', icon: 'ti-truck' },
  { key: 'reports', label: 'التقارير', icon: 'ti-chart-bar' },
  { key: 'users', label: 'المستخدمين', icon: 'ti-shield-lock' },
]

const roles = { admin: 'أدمن', cashier: 'كاشير', driver: 'سائق' }
const roleColors = { admin: { bg: '#dbeafe', color: '#1e40af' }, cashier: { bg: '#dcfce7', color: '#166534' }, driver: { bg: '#fef9c3', color: '#854d0e' } }

export default function Users() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', password: '1234', role: 'cashier', permissions: [] })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const currentUser = JSON.parse(localStorage.getItem('mr_carpet_user') || '{}')

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const { data } = await supabase.from('app_users').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
  }

  async function handleSave() {
    if (!form.name || !form.phone) { alert('أدخل الاسم ورقم التليفون'); return }
    setSaving(true)
    if (editId) {
      await supabase.from('app_users').update({ name: form.name, phone: form.phone, password: form.password, role: form.role, permissions: form.permissions }).eq('id', editId)
    } else {
      await supabase.from('app_users').insert({ name: form.name, phone: form.phone, password: form.password, role: form.role, is_active: true, permissions: form.permissions })
    }
    await fetchUsers()
    setShowForm(false)
    setForm({ name: '', phone: '', password: '1234', role: 'cashier', permissions: [] })
    setEditId(null)
    setSaving(false)
  }

  async function toggleActive(user) {
    if (user.id === currentUser.id) { alert('لا تقدر توقف حسابك الحالي'); return }
    await supabase.from('app_users').update({ is_active: !user.is_active }).eq('id', user.id)
    await fetchUsers()
  }

  async function handleDelete(id) {
    if (id === currentUser.id) { alert('لا تقدر تحذف حسابك الحالي'); return }
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await supabase.from('app_users').delete().eq('id', id)
    await fetchUsers()
  }

  function startEdit(user) {
    setForm({ name: user.name, phone: user.phone, password: user.password || '1234', role: user.role, permissions: user.permissions || [] })
    setEditId(user.id)
    setShowForm(true)
  }

  function togglePermission(key) {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }))
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 14, fontFamily: 'Almarai, sans-serif', textAlign: 'right', background: '#f0f9ff', color: '#0c4a6e', outline: 'none', marginBottom: 12 }

  return (
    <AdminLayout currentPath="/admin/users">
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />

      <div style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>المستخدمين</div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', phone: '', password: '1234', role: 'cashier', permissions: [] }) }}
            style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'Almarai, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-plus" style={{ fontSize: 16 }} />
            مستخدم جديد
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => (
            <div key={user.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: user.id === currentUser.id ? '2px solid #0284c7' : '0.5px solid #e0f2fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleActive(user)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ti ${user.is_active ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15, color: '#0284c7' }} />
                  </button>
                  <button onClick={() => startEdit(user)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-edit" style={{ fontSize: 15, color: '#0284c7' }} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-trash" style={{ fontSize: 15, color: '#dc2626' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: roleColors[user.role]?.bg, color: roleColors[user.role]?.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                    {roles[user.role]}
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0c4a6e' }}>
                    {user.name} {user.id === currentUser.id && <span style={{ fontSize: 11, color: '#0284c7' }}>(أنت)</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, background: user.is_active ? '#dcfce7' : '#f1f5f9', color: user.is_active ? '#166534' : '#64748b', borderRadius: 20, padding: '2px 8px' }}>
                  {user.is_active ? 'نشط' : 'متوقف'}
                </div>
                <div style={{ fontSize: 13, color: '#0284c7' }}>{user.phone}</div>
              </div>

              {user.permissions?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {user.permissions.map(p => {
                    const page = allPages.find(pg => pg.key === p)
                    return page ? (
                      <span key={p} style={{ background: '#e0f2fe', borderRadius: 20, padding: '2px 10px', fontSize: 11, color: '#0284c7', fontWeight: 700 }}>
                        {page.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ background: '#f0f9ff', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: 16, color: '#0284c7' }} />
              </button>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e' }}>{editId ? 'تعديل المستخدم' : 'مستخدم جديد'}</div>
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>الاسم</label>
            <input style={inputStyle} placeholder="اسم المستخدم" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>رقم التليفون</label>
            <input style={inputStyle} placeholder="01xxxxxxxxx" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>كلمة السر</label>
            <input style={inputStyle} placeholder="كلمة السر" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>الصلاحية</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, marginBottom: 16 }}>
              <option value="admin">أدمن</option>
              <option value="cashier">كاشير</option>
              <option value="driver">سائق</option>
            </select>

            <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', marginBottom: 10 }}>الصفحات المسموح بها</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {allPages.map(page => (
                <div key={page.key}
                  onClick={() => togglePermission(page.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: form.permissions.includes(page.key) ? '2px solid #0284c7' : '1px solid #e0f2fe', background: form.permissions.includes(page.key) ? '#f0f9ff' : '#fff', cursor: 'pointer' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: form.permissions.includes(page.key) ? 'none' : '1.5px solid #bae6fd', background: form.permissions.includes(page.key) ? '#0284c7' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {form.permissions.includes(page.key) && <i className="ti ti-check" style={{ fontSize: 12, color: '#fff' }} />}
                  </div>
                  <i className={`ti ${page.icon}`} style={{ fontSize: 15, color: form.permissions.includes(page.key) ? '#0284c7' : '#94a3b8' }} />
                  <span style={{ fontSize: 13, color: form.permissions.includes(page.key) ? '#0c4a6e' : '#94a3b8', fontWeight: form.permissions.includes(page.key) ? 700 : 400 }}>{page.label}</span>
                </div>
              ))}
            </div>

            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: 13, background: saving ? '#7dd3fc' : '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: 'Almarai, sans-serif', cursor: 'pointer' }}>
              {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة المستخدم'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}