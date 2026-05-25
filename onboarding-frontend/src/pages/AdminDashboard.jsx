import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

// ─── Sidebar ────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabs = [
    { id: 'users', icon: '👤', label: 'Users' },
    { id: 'workflows', icon: '📋', label: 'Workflows' },
    { id: 'assign', icon: '🔗', label: 'Assign' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>ONBOARD</h2>
        <p>Admin Panel</p>
      </div>
      <nav className="sidebar-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <strong>{user?.name}</strong>
          <span className="user-role">{user?.role}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Users Tab ──────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch {
      setUsers([])
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setMsg({ type: 'error', text: 'All fields are required.' })
      return
    }
    setLoading(true)
    try {
      await api.post('/admin/users', form)
      setMsg({ type: 'success', text: `User "${form.name}" created successfully.` })
      setForm({ name: '', email: '', password: '', role: 'USER' })
      fetchUsers()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create user.' })
    } finally {
      setLoading(false)
    }
  }

  const roleBadge = (role) => {
    if (role === 'ADMIN') return <span className="badge badge-red">Admin</span>
    if (role === 'MANAGER') return <span className="badge badge-blue">Manager</span>
    return <span className="badge badge-yellow">User</span>
  }

  return (
    <div>
      <div className="page-header">
        <h1>User Management</h1>
        <p>Create and manage system users</p>
      </div>

      <div className="grid-2">
        {/* CREATE FORM */}
        <div className="card">
          <p className="card-title">Create New User</p>

          {msg.text && (
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="text" value={form.password} onChange={handleChange} placeholder="Temp password" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="USER">User (Employee)</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '+ Create User'}
            </button>
          </form>
        </div>

        {/* USERS LIST */}
        <div className="card">
          <p className="card-title">All Users ({users.length})</p>
          {users.length === 0 ? (
            <div className="empty-state"><p>No users yet. Create one.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Workflows Tab ──────────────────────────────────────────
function WorkflowsTab() {
  const [workflows, setWorkflows] = useState([])
  const [selected, setSelected] = useState(null)
  const [steps, setSteps] = useState([])
  const [wfForm, setWfForm] = useState({ title: '', job_type: '', description: '' })
  const [stepForm, setStepForm] = useState({ title: '', description: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [stepMsg, setStepMsg] = useState({ type: '', text: '' })

  const fetchWorkflows = async () => {
    try {
      const res = await api.get('/admin/workflows')
      setWorkflows(res.data)
    } catch { setWorkflows([]) }
  }

  const fetchSteps = async (wfId) => {
    try {
      const res = await api.get(`/admin/workflows/${wfId}/steps`)
      setSteps(res.data)
    } catch { setSteps([]) }
  }

  useEffect(() => { fetchWorkflows() }, [])

  const handleSelectWorkflow = (wf) => {
    setSelected(wf)
    fetchSteps(wf.id)
  }

  const handleCreateWorkflow = async (e) => {
    e.preventDefault()
    if (!wfForm.title || !wfForm.job_type) {
      setMsg({ type: 'error', text: 'Title and job type are required.' })
      return
    }
    try {
      await api.post('/admin/workflows', wfForm)
      setMsg({ type: 'success', text: 'Workflow created!' })
      setWfForm({ title: '', job_type: '', description: '' })
      fetchWorkflows()
    } catch {
      setMsg({ type: 'error', text: 'Failed to create workflow.' })
    }
  }

  const handleAddStep = async (e) => {
    e.preventDefault()
    if (!stepForm.title) {
      setStepMsg({ type: 'error', text: 'Step title is required.' })
      return
    }
    try {
      await api.post(`/admin/workflows/${selected.id}/steps`, {
        ...stepForm,
        step_order: steps.length + 1,
      })
      setStepMsg({ type: 'success', text: 'Step added!' })
      setStepForm({ title: '', description: '' })
      fetchSteps(selected.id)
    } catch {
      setStepMsg({ type: 'error', text: 'Failed to add step.' })
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Workflow Management</h1>
        <p>Create workflows and add onboarding steps</p>
      </div>

      <div className="grid-2">
        {/* CREATE WORKFLOW */}
        <div>
          <div className="card">
            <p className="card-title">Create Workflow</p>
            {msg.text && (
              <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>
            )}
            <form onSubmit={handleCreateWorkflow}>
              <div className="form-group">
                <label>Workflow Title</label>
                <input
                  value={wfForm.title}
                  onChange={(e) => setWfForm({ ...wfForm, title: e.target.value })}
                  placeholder="e.g. Engineer Onboarding"
                />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <input
                  value={wfForm.job_type}
                  onChange={(e) => setWfForm({ ...wfForm, job_type: e.target.value })}
                  placeholder="e.g. ENGINEER, PM, DESIGNER"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={wfForm.description}
                  onChange={(e) => setWfForm({ ...wfForm, description: e.target.value })}
                  placeholder="Brief description of this workflow..."
                />
              </div>
              <button type="submit" className="btn btn-primary">+ Create Workflow</button>
            </form>
          </div>

          {/* WORKFLOW LIST */}
          <div className="card">
            <p className="card-title">All Workflows</p>
            {workflows.length === 0 ? (
              <div className="empty-state"><p>No workflows yet.</p></div>
            ) : (
              workflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => handleSelectWorkflow(wf)}
                  style={{
                    padding: '12px',
                    border: `1px solid ${selected?.id === wf.id ? 'rgba(79,255,176,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    background: selected?.id === wf.id ? 'var(--accent-glow)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div className="flex-between">
                    <strong style={{ fontSize: '13px' }}>{wf.title}</strong>
                    <span className="badge badge-blue">{wf.job_type}</span>
                  </div>
                  {wf.description && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{wf.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* STEPS */}
        <div className="card">
          <p className="card-title">
            {selected ? `Steps — ${selected.title}` : 'Select a workflow to manage steps'}
          </p>

          {selected ? (
            <>
              {stepMsg.text && (
                <div className={`alert ${stepMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{stepMsg.text}</div>
              )}

              {/* Steps list */}
              {steps.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 0' }}><p>No steps yet. Add one below.</p></div>
              ) : (
                steps
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((s) => (
                    <div key={s.id} className="step-item">
                      <div className="step-num">{s.step_order}</div>
                      <div className="step-info">
                        <h4>{s.title}</h4>
                        {s.description && <p>{s.description}</p>}
                      </div>
                    </div>
                  ))
              )}

              <hr className="divider" />

              {/* Add step form */}
              <form onSubmit={handleAddStep}>
                <div className="form-group">
                  <label>Step Title</label>
                  <input
                    value={stepForm.title}
                    onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                    placeholder="e.g. Submit past projects"
                  />
                </div>
                <div className="form-group">
                  <label>Description (optional)</label>
                  <input
                    value={stepForm.description}
                    onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                    placeholder="What does the user need to do?"
                  />
                </div>
                <button type="submit" className="btn btn-secondary btn-sm">+ Add Step</button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <p>← Click a workflow from the left to add steps to it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Assign Tab ─────────────────────────────────────────────
function AssignTab() {
  const [users, setUsers] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [form, setForm] = useState({ user_id: '', workflow_id: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [u, w] = await Promise.all([api.get('/admin/users'), api.get('/admin/workflows')])
        setUsers(u.data.filter((u) => u.role === 'USER'))
        setWorkflows(w.data)
      } catch {}
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.user_id || !form.workflow_id) {
      setMsg({ type: 'error', text: 'Please select both a user and a workflow.' })
      return
    }
    try {
      await api.post('/admin/assign', { user_id: Number(form.user_id), workflow_id: Number(form.workflow_id) })
      setMsg({ type: 'success', text: 'Workflow assigned successfully!' })
      setForm({ user_id: '', workflow_id: '' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to assign workflow.' })
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Assign Workflows</h1>
        <p>Assign an onboarding workflow to an employee</p>
      </div>

      <div style={{ maxWidth: '480px' }}>
        <div className="card">
          <p className="card-title">Assign Workflow to User</p>

          {msg.text && (
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Employee</label>
              <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
                <option value="">-- Choose an employee --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Workflow</label>
              <select value={form.workflow_id} onChange={(e) => setForm({ ...form, workflow_id: e.target.value })}>
                <option value="">-- Choose a workflow --</option>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>{w.title} ({w.job_type})</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary">Assign →</button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Dashboard ────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users')

  const renderTab = () => {
    if (activeTab === 'users') return <UsersTab />
    if (activeTab === 'workflows') return <WorkflowsTab />
    if (activeTab === 'assign') return <AssignTab />
  }

  return (
    <div className="layout">
      <Sidebar active={activeTab} setActive={setActiveTab} />
      <main className="main-content">{renderTab()}</main>
    </div>
  )
}
