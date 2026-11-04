const API_BASE = '/api';

export const api = {
  // Doctors & Departments
  async getDoctors() {
    const res = await fetch(`${API_BASE}/doctors`);
    if (!res.ok) throw new Error('Failed to load doctors');
    return res.json();
  },

  // Slots
  async getSlots(department, date) {
    const res = await fetch(`${API_BASE}/slots?department=${encodeURIComponent(department)}&date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Failed to load slots');
    return res.json();
  },

  // Book Appointment
  async bookAppointment(data) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to book appointment');
    return result;
  },

  // Get My Appointments
  async getAppointments(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/appointments${query}`);
    if (!res.ok) throw new Error('Failed to load appointments');
    return res.json();
  },

  // Cancel Appointment
  async cancelAppointment(id) {
    const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
  },

  // Admin Login
  async adminLogin(username, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Invalid credentials');
    return result;
  },

  // Admin Dashboard
  async getAdminDashboard(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.department) searchParams.set('department', params.department);
    if (params.status) searchParams.set('status', params.status);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const res = await fetch(`${API_BASE}/admin/dashboard?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load admin dashboard');
    return res.json();
  },

  // CSV Export URL
  getExportCsvUrl() {
    return `${API_BASE}/admin/export-csv`;
  },

  // Chat RAG
  async askFaq(question) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to get answer');
    return result;
  },

  // Sources
  async getSources() {
    const res = await fetch(`${API_BASE}/sources`);
    if (!res.ok) throw new Error('Failed to load sources');
    return res.json();
  }
};

