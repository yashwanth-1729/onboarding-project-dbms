import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(null)   // { workflow, steps, progress }
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null) // step id being completed

  const fetchWorkflow = async () => {
    try {
      const res = await api.get('/user/my-workflow')
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkflow() }, [])

  const handleComplete = async (stepId) => {
    setCompleting(stepId)
    try {
      await api.patch(`/user/steps/${stepId}/complete`)
      fetchWorkflow() // refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark step complete.')
    } finally {
      setCompleting(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Calculate progress
  const totalSteps = data?.steps?.length || 0
  const doneSteps = data?.progress?.filter((p) => p.status === 'DONE')?.length || 0
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

  const getStepStatus = (stepId) => {
    const p = data?.progress?.find((p) => p.step_id === stepId)
    return p?.status || 'PENDING'
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <h2>ONBOARD</h2>
          <p>My Dashboard</p>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-btn active">
            <span className="nav-icon">📋</span>
            My Workflow
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

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1>Welcome, {user?.name} 👋</h1>
          <p>Complete your onboarding tasks below.</p>
        </div>

        {loading ? (
          <div className="card">
            <p style={{ color: 'var(--text-muted)' }}>Loading your workflow...</p>
          </div>
        ) : !data ? (
          <div className="card">
            <div className="empty-state">
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>📭</p>
              <p>No workflow assigned yet. Your admin will assign one soon.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Overview */}
            <div className="grid-3" style={{ marginBottom: '24px' }}>
              <div className="stat-card">
                <p className="stat-label">Workflow</p>
                <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px', color: 'var(--text)' }}>
                  {data.workflow?.title}
                </p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Progress</p>
                <p className="stat-value">{pct}%</p>
                <div className="progress-wrap" style={{ marginTop: '8px' }}>
                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="stat-card">
                <p className="stat-label">Status</p>
                <p className="stat-value" style={{ fontSize: '18px', marginTop: '4px' }}>
                  {doneSteps} / {totalSteps}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>tasks done</span>
                </p>
                {pct === 100 && (
                  <span className="badge badge-green" style={{ marginTop: '6px' }}>✓ Completed</span>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="card">
              <p className="card-title">Onboarding Steps</p>

              {data.steps.length === 0 ? (
                <div className="empty-state"><p>No steps in this workflow yet.</p></div>
              ) : (
                data.steps
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((step) => {
                    const status = getStepStatus(step.id)
                    const isDone = status === 'DONE'
                    return (
                      <div key={step.id} className={`step-item ${isDone ? 'done' : ''}`}>
                        <div className="step-num">
                          {isDone ? '✓' : step.step_order}
                        </div>
                        <div className="step-info" style={{ flex: 1 }}>
                          <h4 style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.6 : 1 }}>
                            {step.title}
                          </h4>
                          {step.description && <p>{step.description}</p>}
                        </div>
                        <div>
                          {isDone ? (
                            <span className="badge badge-green">Done</span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleComplete(step.id)}
                              disabled={completing === step.id}
                            >
                              {completing === step.id ? '...' : 'Mark Done'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
              )}
            </div>

            {pct === 100 && (
              <div className="card" style={{ borderColor: 'rgba(12,166,120,0.3)', background: 'var(--success-bg)', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</p>
                <p style={{ color: 'var(--accent)', fontWeight: 600 }}>Onboarding Complete!</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  You've finished all your onboarding tasks. Welcome to the team!
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
