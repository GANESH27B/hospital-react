import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, XCircle, Calendar, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function MyAppointments({ onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchAppointments = (query = '') => {
    setLoading(true);
    api.getAppointments(query)
      .then(res => {
        setAppointments(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments(search);
  }, [search]);

  const handleCancel = async (id) => {
    if (!window.confirm(`Are you sure you want to cancel Appointment #${id}?`)) {
      return;
    }

    setCancellingId(id);
    try {
      await api.cancelAppointment(id);
      setFeedback(`Appointment #${id} was cancelled successfully.`);
      fetchAppointments(search);
    } catch (err) {
      alert('Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">
          <ClipboardList size={22} color="#0284c7" />
          <span>My Appointments</span>
        </h3>
        <p className="card-subtitle">
          Review your scheduled consultations and cancel appointments if required.
        </p>

        {feedback && (
          <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{feedback}</span>
            <button className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => setFeedback('')}>
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by ID, patient name, department, doctor or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h4>No appointments found</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              {search ? 'No records match your search criteria.' : 'You have not booked any appointments yet.'}
            </p>
            <button className="btn btn-primary" onClick={() => onNavigate('booking')}>
              Book an Appointment
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map((a) => {
              const isConfirmed = a.status === 'Confirmed';
              return (
                <div
                  key={a.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#ffffff',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        Appointment #{a.id}
                      </span>
                    </div>
                    <span className={`status-pill ${isConfirmed ? 'status-confirmed' : 'status-cancelled'}`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="grid-2" style={{ marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <User size={16} color="#64748b" />
                        <span><strong>Patient:</strong> {a.patient_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>📞 Phone:</span>
                        <span>{a.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Stethoscope size={16} color="#64748b" />
                        <span><strong>Dept:</strong> {a.department}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>👨‍⚕️ Doctor:</span>
                        <span>{a.doctor}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Calendar size={16} color="#64748b" />
                        <span><strong>Date:</strong> {a.appointment_date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#64748b" />
                        <span><strong>Time:</strong> {a.appointment_time}</span>
                      </div>
                    </div>
                  </div>

                  {isConfirmed && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f8fafc' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                        disabled={cancellingId === a.id}
                        onClick={() => handleCancel(a.id)}
                      >
                        <XCircle size={15} />
                        <span>{cancellingId === a.id ? 'Cancelling...' : 'Cancel Appointment'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

