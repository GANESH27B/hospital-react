import React, { useEffect, useState } from 'react';
import { Users, CalendarPlus, Stethoscope, Award, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Doctors({ onNavigate }) {
  const [data, setData] = useState({ doctors: [], departments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDoctors()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="card">
        <h3 className="card-title">
          <Users size={22} color="#0284c7" />
          <span>Doctors & Specialists</span>
        </h3>
        <p className="card-subtitle">
          Explore the experienced medical doctors and clinical specialists available at CarePlus Hospital.
        </p>

        {loading ? (
          <p>Loading doctors...</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Department</th>
                  <th>Clinical Experience</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.doctors.map((doc, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Stethoscope size={16} color="#0284c7" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-tag" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                        {doc.department}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={15} color="#0d9488" />
                        <span>{doc.experience}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => onNavigate('booking', { department: doc.department })}
                      >
                        <span>Book</span>
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Departments */}
      <div className="card">
        <h3 className="card-title">🏥 Available Clinical Departments</h3>
        <p className="card-subtitle">
          CarePlus Hospital hosts specialized treatment departments equipped with modern diagnostics.
        </p>

        <div className="grid-3" style={{ marginBottom: '24px' }}>
          {data.departments.map((dept, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{dept}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>CarePlus Madanapalle</p>
              </div>
              <button
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => onNavigate('booking', { department: dept })}
              >
                Select
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-block" onClick={() => onNavigate('booking')}>
          <CalendarPlus size={18} />
          <span>Go to Appointment Booking</span>
        </button>
      </div>
    </div>
  );
}

