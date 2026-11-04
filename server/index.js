const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const {
  addAppointment,
  getAppointments,
  appointmentExists,
  getBookedTimes,
  cancelAppointment
} = require('./database');

const {
  askQuestion,
  getSources
} = require('./rag');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Base API route / Health check
app.get('/api', (req, res) => {
  res.json({ message: 'CarePlus Hospital API is active', status: 'healthy' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Doctor & Department Metadata
const DOCTORS = [
  { name: 'Dr. Arun Kumar', department: 'Cardiology', experience: '12 years', phone: '+91 98765 43210' },
  { name: 'Dr. Priya Sharma', department: 'Dermatology', experience: '8 years', phone: '+91 98765 43211' },
  { name: 'Dr. Rahul Verma', department: 'Orthopedics', experience: '10 years', phone: '+91 98765 43212' },
  { name: 'Dr. Anitha Rao', department: 'Pediatrics', experience: '9 years', phone: '+91 98765 43213' },
  { name: 'Dr. Kiran Kumar', department: 'Neurology', experience: '11 years', phone: '+91 98765 43214' }
];

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "ENT",
  "Ophthalmology"
];

const DOCTOR_MAPPING = {
  "Cardiology": "Dr. Arun Kumar",
  "Dermatology": "Dr. Priya Sharma",
  "Orthopedics": "Dr. Rahul Verma",
  "Pediatrics": "Dr. Anitha Rao",
  "Neurology": "Dr. Kiran Kumar",
  "General Medicine": "No doctor listed",
  "ENT": "No doctor listed",
  "Ophthalmology": "No doctor listed"
};

// OPD Timings (Python weekday format: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun)
const OPD_TIMINGS = {
  "General Medicine": { days: [0, 1, 2, 3, 4, 5], start: 8, end: 12 },
  "Cardiology": { days: [0, 1, 2, 3, 4], start: 10, end: 13 },
  "Dermatology": { days: [0, 1, 2, 3, 4, 5], start: 14, end: 17 },
  "Orthopedics": { days: [0, 1, 2, 3, 4], start: 9, end: 12 },
  "Pediatrics": { days: [0, 1, 2, 3, 4, 5], start: 10, end: 13 },
  "Neurology": { days: [1, 3], start: 15, end: 18 },
  "ENT": { days: [], start: null, end: null },
  "Ophthalmology": { days: [], start: null, end: null }
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Convert Date string 'YYYY-MM-DD' to Python weekday (0=Mon, 6=Sun)
function getPythonWeekday(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const jsDay = date.getDay(); // 0 is Sunday, 1 is Monday
  return jsDay === 0 ? 6 : jsDay - 1;
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// 1. Get Doctors and Departments
app.get('/api/doctors', (req, res) => {
  res.json({
    doctors: DOCTORS,
    departments: DEPARTMENTS,
    doctorMapping: DOCTOR_MAPPING
  });
});

// 2. Get Available Slots for Department & Date
app.get('/api/slots', (req, res) => {
  const { department, date } = req.query;

  if (!department || !date) {
    return res.status(400).json({ error: 'Department and date are required.' });
  }

  const timing = OPD_TIMINGS[department];
  if (!timing) {
    return res.status(400).json({ error: 'Unknown department.' });
  }

  const doctor = DOCTOR_MAPPING[department] || 'No doctor listed';

  if (!timing.days || timing.days.length === 0) {
    return res.json({
      available: false,
      message: `No appointment schedule is currently available for ${department}.`,
      doctor,
      slots: [],
      bookedSlots: []
    });
  }

  const pyWeekday = getPythonWeekday(date);
  const dayName = DAY_NAMES[pyWeekday];

  if (!timing.days.includes(pyWeekday)) {
    return res.json({
      available: false,
      message: `${department} OPD is not available on ${dayName}.`,
      doctor,
      slots: [],
      bookedSlots: []
    });
  }

  // Generate 30-minute slots
  const allSlots = [];
  let currentHour = timing.start;
  let currentMin = 0;

  while (currentHour < timing.end || (currentHour === timing.end && currentMin === 0)) {
    if (currentHour === timing.end && currentMin === 0) break;
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    allSlots.push(timeStr);
    currentMin += 30;
    if (currentMin >= 60) {
      currentHour += 1;
      currentMin = 0;
    }
  }

  // Get already booked times
  const rawBooked = getBookedTimes(doctor, date);
  const bookedSlots = rawBooked.map(t => {
    // Normalise 'HH:MM:SS' or 'HH:MM'
    const parts = t.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  });

  const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

  res.json({
    available: true,
    dayName,
    doctor,
    allSlots,
    bookedSlots,
    availableSlots
  });
});

// 3. Book Appointment
app.post('/api/appointments', (req, res) => {
  const { patient_name, phone, department, doctor, appointment_date, appointment_time } = req.body;

  if (!patient_name || !patient_name.trim()) {
    return res.status(400).json({ error: 'Please enter patient name.' });
  }

  const cleanPhone = String(phone || '').trim();
  if (!/^\d{10}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (appointment_date < todayStr) {
    return res.status(400).json({ error: 'Appointment date cannot be in the past.' });
  }

  if (appointmentExists(doctor, appointment_date, appointment_time)) {
    return res.status(400).json({ error: '❌ This appointment slot has already been booked.' });
  }

  const id = addAppointment(
    patient_name.trim(),
    cleanPhone,
    department,
    doctor,
    appointment_date,
    appointment_time
  );

  res.status(201).json({
    message: 'Appointment booked successfully!',
    appointment: {
      id,
      patient_name: patient_name.trim(),
      phone: cleanPhone,
      department,
      doctor,
      appointment_date,
      appointment_time,
      status: 'Confirmed'
    }
  });
});

// 4. Get Appointments (with optional search filter)
app.get('/api/appointments', (req, res) => {
  const { search } = req.query;
  let appointments = getAppointments();

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    appointments = appointments.filter(a =>
      String(a.id).toLowerCase().includes(q) ||
      (a.patient_name && a.patient_name.toLowerCase().includes(q)) ||
      (a.department && a.department.toLowerCase().includes(q)) ||
      (a.doctor && a.doctor.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q))
    );
  }

  res.json(appointments);
});

// 5. Cancel Appointment
app.patch('/api/appointments/:id/cancel', (req, res) => {
  const id = req.params.id;
  cancelAppointment(id);
  res.json({ success: true, message: 'Appointment cancelled successfully.' });
});

// 6. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUser && password === adminPass) {
    res.json({ success: true, token: 'admin-auth-token-careplus' });
  } else {
    res.status(401).json({ error: 'Invalid username or password.' });
  }
});

// 7. Admin Dashboard Analytics & Filtered Records
app.get('/api/admin/dashboard', (req, res) => {
  const { search, department, status, startDate, endDate } = req.query;
  let appointments = getAppointments();

  const total = appointments.length;
  const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
  const cancelled = appointments.filter(a => a.status === 'Cancelled').length;

  // Department counts
  const byDepartment = {};
  // Doctor counts
  const byDoctor = {};
  // Status counts
  const byStatus = { Confirmed: confirmed, Cancelled: cancelled };
  // Date counts
  const byDate = {};

  appointments.forEach(a => {
    byDepartment[a.department] = (byDepartment[a.department] || 0) + 1;
    byDoctor[a.doctor] = (byDoctor[a.doctor] || 0) + 1;
    byDate[a.appointment_date] = (byDate[a.appointment_date] || 0) + 1;
  });

  // Apply filters for the table
  let filtered = [...appointments];

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(a =>
      String(a.id).toLowerCase().includes(q) ||
      (a.patient_name && a.patient_name.toLowerCase().includes(q)) ||
      (a.department && a.department.toLowerCase().includes(q)) ||
      (a.doctor && a.doctor.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q))
    );
  }

  if (department && department !== 'All Departments') {
    filtered = filtered.filter(a => a.department === department);
  }

  if (status && status !== 'All Status') {
    filtered = filtered.filter(a => a.status === status);
  }

  if (startDate) {
    filtered = filtered.filter(a => a.appointment_date >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter(a => a.appointment_date <= endDate);
  }

  res.json({
    stats: { total, confirmed, cancelled },
    charts: { byDepartment, byDoctor, byStatus, byDate },
    appointments: filtered
  });
});

// 8. Download CSV Report
app.get('/api/admin/export-csv', (req, res) => {
  const appointments = getAppointments();
  const headers = ['Appointment ID', 'Patient', 'Phone', 'Department', 'Doctor', 'Date', 'Time', 'Status'];

  const rows = appointments.map(a => [
    a.id,
    `"${(a.patient_name || '').replace(/"/g, '""')}"`,
    `"${(a.phone || '').replace(/"/g, '""')}"`,
    `"${(a.department || '').replace(/"/g, '""')}"`,
    `"${(a.doctor || '').replace(/"/g, '""')}"`,
    a.appointment_date,
    a.appointment_time,
    a.status
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="careplus_appointment_report.csv"');
  res.status(200).send(csvContent);
});

// 9. Chatbot FAQ (RAG)
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Please enter a question.' });
    }

    const response = await askQuestion(question.trim());
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process hospital question.' });
  }
});

// 10. Knowledge Base Sources
app.get('/api/sources', (req, res) => {
  const sources = getSources();
  res.json(sources);
});

// Serve frontend build in production if available
const buildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(buildPath));

// Only start the HTTP listener if executed directly (e.g., node server/index.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🏥 CarePlus Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

