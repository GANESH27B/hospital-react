import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  Calendar,
  XCircle,
  BarChart3,
  LogOut,
  RefreshCw,
  Table
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard({ onLogout }) {
  const [data, setData] = useState({
    stats: { total: 0, confirmed: 0, cancelled: 0 },
    charts: { byDepartment: {}, byDoctor: {}, byStatus: {}, byDate: {} },
    appointments: []
  });

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [departmentsList, setDepartmentsList] = useState([]);

  const loadData = () => {
    setLoading(true);
    api.getAdminDashboard({
      search,
      department: departmentFilter,
      status: statusFilter,
      startDate,
      endDate
    })
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    api.getDoctors().then(res => {
      setDepartmentsList(res.departments);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [search, departmentFilter, statusFilter, startDate, endDate]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm(`Admin action: Are you sure you want to cancel Appointment #${id}?`)) {
      return;
    }

    try {
      await api.cancelAppointment(id);
      loadData();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartmentFilter('All Departments');
    setStatusFilter('All Status');
    setStartDate('');
    setEndDate('');
  };

  const renderHorizontalBarChart = (obj) => {
    const entries = Object.entries(obj || {});
    if (entries.length === 0) return <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No data available</p>;
    const maxVal = Math.max(...entries.map(([, val]) => val), 1);

    return (
      <div className="chart-bar-container">
        {entries.map(([label, val]) => {
          const pct = Math.round((val / maxVal) * 100);
          return (
            <div key={label} className="chart-bar-row">
              <span className="chart-bar-label" title={label}>{label}</span>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${pct}%` }}></div>
              </div>
              <span className="chart-bar-val">{val}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} color="#0284c7" />
            <span>CarePlus Admin Dashboard</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Administrative oversight, appointment moderation, real-time analytics, and data reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={api.getExportCsvUrl()}
            download="careplus_appointment_report.csv"
            className="btn btn-outline"
            style={{ textDecoration: 'none' }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </a>
          <button className="btn btn-danger" onClick={onLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-3">
        <div className="stat-card">
          <span className="stat-label">Total Appointments</span>
          <span className="stat-value">{data.stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Confirmed Appointments</span>
          <span className="stat-value" style={{ color: '#10b981' }}>{data.stats.confirmed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Cancelled Appointments</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>{data.stats.cancelled}</span>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <Filter size={18} color="#0284c7" />
            <span>Filter & Search Appointments</span>
          </h3>
          <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleResetFilters}>
            <RefreshCw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid-2">
          <div>
            <label className="form-label">Search Query</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search patient, phone, doctor, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All Departments">All Departments</option>
                {departmentsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '14px', marginBottom: 0 }}>
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">
            <BarChart3 size={18} color="#0284c7" />
            <span>Appointments by Department</span>
          </h3>
          {renderHorizontalBarChart(data.charts.byDepartment)}
        </div>

        <div className="card">
          <h3 className="card-title">
            <BarChart3 size={18} color="#0d9488" />
            <span>Appointments by Doctor</span>
          </h3>
          {renderHorizontalBarChart(data.charts.byDoctor)}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">
            <BarChart3 size={18} color="#10b981" />
            <span>Appointment Status Distribution</span>
          </h3>
          {renderHorizontalBarChart(data.charts.byStatus)}
        </div>

        <div className="card">
          <h3 className="card-title">
            <Calendar size={18} color="#2563eb" />
            <span>Appointments by Date</span>
          </h3>
          {renderHorizontalBarChart(data.charts.byDate)}
        </div>
      </div>

      {/* Appointment Records Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              <Table size={18} color="#0284c7" />
              <span>All Appointment Records ({data.appointments.length})</span>
            </h3>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Showing filtered results based on current search and criteria.
            </p>
          </div>

          <a
            href={api.getExportCsvUrl()}
            download="careplus_appointment_report.csv"
            className="btn btn-outline"
            style={{ padding: '6px 14px', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            <Download size={14} />
            <span>Download CSV</span>
          </a>
        </div>

        {loading ? (
          <p>Loading records...</p>
        ) : data.appointments.length === 0 ? (
          <p style={{ color: '#64748b', padding: '20px 0', textAlign: 'center' }}>
            No appointments match the selected filters.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.appointments.map((a) => {
                  const isConfirmed = a.status === 'Confirmed';
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700 }}>#{a.id}</td>
                      <td>{a.patient_name}</td>
                      <td>{a.phone}</td>
                      <td>{a.department}</td>
                      <td>{a.doctor}</td>
                      <td>{a.appointment_date}</td>
                      <td>{a.appointment_time}</td>
                      <td>
                        <span className={`status-pill ${isConfirmed ? 'status-confirmed' : 'status-cancelled'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        {isConfirmed ? (
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleCancelAppointment(a.id)}
                          >
                            <XCircle size={13} />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

