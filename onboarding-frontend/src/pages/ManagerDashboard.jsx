import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function ManagerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openReminder, setOpenReminder] = useState(null) // user id
  const [reminderMsg, setReminderMsg] = useState('')
  const [sendingTo, setSendingTo] = useState(null)
  const [feedback, setFeedback] = useState({}) // { userId: 'success' | 'error' }
  const [openDetail, setOpenDetail] = useState(null) // user id whose steps are expanded
  const [stepDetails, setStepDetails] = useState({}) // { userId: [steps] }
  const [loadingDetail, setLoadingDetail] = useState(null)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/manager/users')
      setUsers(res.data)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSendReminder = async (userId) => {
    if (!reminderMsg.trim()) return
    setSendingTo(userId)
    try {
      await api.post('/manager/reminders', { user_id: userId, message: reminderMsg })
      setFeedback({ ...feedback, [userId]: 'success' })
      setOpenReminder(null)
      setReminderMsg('')
    } catch {
      setFeedback({ ...feedback, [userId]: 'error' })
    } finally {
      setSendingTo(null)
    }
  }

  // Expand/collapse a user's detailed step list (fetched on first open)
  const toggleDetail = async (userId) => {
    if (openDetail === userId) {
      setOpenDetail(null)
      return
    }
    setOpenDetail(userId)
    if (!stepDetails[userId]) {
      setLoadingDetail(userId)
      try {
        const res = await api.get(`/manager/users/${userId}/steps`)
        setStepDetails((prev) => ({ ...prev, [userId]: res.data }))
      } catch {
        setStepDetails((prev) => ({ ...prev, [userId]: [] }))
      } finally {
        setLoadingDetail(null)
      }
    }
  }

  // Stats
  const totalUsers = users.length
  const completed = users.filter((u) => u.workflow_status === 'COMPLETED').length
  const inProgress = users.filter((u) => u.workflow_status === 'IN_PROGRESS').length
  const noWorkflow = users.filter((u) => !u.workflow_status).length

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <h2>ONBOARD</h2>
          <p>Manager Panel</p>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-btn active">
            <span className="nav-icon">📊</span>
            Progress Overview
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <main className="main-content">
        <div className="page-header">
          <h1>Team Onboarding Progress</h1>
          <p>Monitor employee progress and send reminders for pending tasks.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <p className="stat-label">Total Employees</p>
            <p className="stat-value">{totalUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Completed</p>
            <p className="stat-value" style={{ color: 'var(--accent)' }}>{completed}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">In Progress</p>
            <p className="stat-value" style={{ color: 'var(--warning)' }}>{inProgress}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <p className="card-title">Employee Status</p>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : users.length === 0 ? (
            <div className="empty-state"><p>No employees found.</p></div>
          ) : (
            <div>
              {users.map((u) => {
                const pct = u.total_steps > 0 ? Math.round((u.done_steps / u.total_steps) * 100) : 0
                const isOpen = openReminder === u.id

                return (
                  <div
                    key={u.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      marginBottom: '12px',
                    }}
                  >
                    {/* Row */}
                    <div className="flex-between">
                      <div>
                        <strong style={{ fontSize: '14px' }}>{u.name}</strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{u.email}</p>
                      </div>

                      <div className="flex-center gap-12">
                        {/* Status badge */}
                        {!u.workflow_status ? (
                          <span className="badge badge-red">No Workflow</span>
                        ) : u.workflow_status === 'COMPLETED' ? (
                          <span className="badge badge-green">Completed</span>
                        ) : (
                          <span className="badge badge-yellow">In Progress</span>
                        )}

                        {/* Reminder button — only for in-progress */}
                        {u.workflow_status === 'IN_PROGRESS' && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              setOpenReminder(isOpen ? null : u.id)
                              setReminderMsg('')
                              setFeedback({ ...feedback, [u.id]: '' })
                            }}
                          >
                            🔔 Remind
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar (only if assigned) */}
                    {u.workflow_status && (
                      <div style={{ marginTop: '12px' }}>
                        <div className="flex-between mb-4">
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {u.workflow_title || 'Workflow'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {u.done_steps || 0}/{u.total_steps || 0} steps · {pct}%
                          </span>
                        </div>
                        <div className="progress-wrap">
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Reminder form */}
                    {isOpen && (
                      <div className="reminder-form" style={{ marginTop: '12px' }}>
                        {feedback[u.id] === 'success' && (
                          <div className="alert alert-success" style={{ marginBottom: '8px' }}>Reminder sent!</div>
                        )}
                        {feedback[u.id] === 'error' && (
                          <div className="alert alert-error" style={{ marginBottom: '8px' }}>Failed to send reminder.</div>
                        )}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label>Reminder Message</label>
                          <textarea
                            value={reminderMsg}
                            onChange={(e) => setReminderMsg(e.target.value)}
                            placeholder={`Hey ${u.name}, please complete your pending onboarding tasks...`}
                            style={{ minHeight: '70px' }}
                          />
                        </div>
                        <div className="flex-center gap-8">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleSendReminder(u.id)}
                            disabled={sendingTo === u.id || !reminderMsg.trim()}
                          >
                            {sendingTo === u.id ? 'Sending...' : 'Send Reminder'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setOpenReminder(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
