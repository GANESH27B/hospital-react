const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'appointments.db');

function getJsonFilePath() {
  if (process.env.VERCEL) {
    const tmpPath = path.join('/tmp', 'appointments.json');
    if (!fs.existsSync(tmpPath)) {
      const candidates = [
        path.join(__dirname, 'appointments.json'),
        path.join(process.cwd(), 'appointments.json'),
        path.join(__dirname, '..', 'appointments.json')
      ];
      const source = candidates.find(p => fs.existsSync(p));
      try {
        if (source) {
          fs.copyFileSync(source, tmpPath);
        } else {
          fs.writeFileSync(tmpPath, '[]', 'utf-8');
        }
      } catch (err) {
        console.warn('Could not initialize /tmp/appointments.json:', err);
      }
    }
    return tmpPath;
  }
  const localDefault = path.join(__dirname, 'appointments.json');
  if (fs.existsSync(localDefault)) return localDefault;
  const parentDefault = path.join(__dirname, '..', 'appointments.json');
  return fs.existsSync(parentDefault) ? parentDefault : path.join(process.cwd(), 'appointments.json');
}

let dbDriver = null;
let dbInstance = null;

// Try to initialize better-sqlite3 or sqlite3 if available (non-serverless local mode)
if (!process.env.VERCEL) {
  try {
    const Database = require('better-sqlite3');
    dbInstance = new Database(DB_FILE);
    dbDriver = 'better-sqlite3';
    console.log('✅ SQLite connected via better-sqlite3:', DB_FILE);
  } catch (e) {
    dbDriver = 'json';
    console.log('ℹ️ Running JSON persistent store at:', getJsonFilePath());
  }
} else {
  dbDriver = 'json';
  console.log('ℹ️ Running JSON persistent store on Vercel at:', getJsonFilePath());
}

// Initialize tables / file structure
function initDatabase() {
  if (dbDriver === 'better-sqlite3') {
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        doctor TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Confirmed'
      )
    `);
  } else {
    // JSON store initialization
    const jsonFile = getJsonFilePath();
    if (!fs.existsSync(jsonFile)) {
      fs.writeFileSync(jsonFile, JSON.stringify([], null, 2), 'utf-8');
    }
  }
}

function readJsonAppointments() {
  const jsonFile = getJsonFilePath();
  try {
    if (!fs.existsSync(jsonFile)) return [];
    const data = fs.readFileSync(jsonFile, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading JSON store:', err);
    return [];
  }
}

function writeJsonAppointments(list) {
  const jsonFile = getJsonFilePath();
  fs.writeFileSync(jsonFile, JSON.stringify(list, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// Database Operations matching database.py
// -------------------------------------------------------------

function addAppointment(patient_name, phone, department, doctor, appointment_date, appointment_time) {
  if (dbDriver === 'better-sqlite3') {
    const stmt = dbInstance.prepare(`
      INSERT INTO appointments
      (patient_name, phone, department, doctor, appointment_date, appointment_time, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
    `);
    const info = stmt.run(patient_name, phone, department, doctor, String(appointment_date), String(appointment_time));
    return info.lastInsertRowid;
  } else {
    const appointments = readJsonAppointments();
    const nextId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    const newAppointment = {
      id: nextId,
      patient_name,
      phone,
      department,
      doctor,
      appointment_date: String(appointment_date),
      appointment_time: String(appointment_time),
      status: 'Confirmed'
    };
    appointments.unshift(newAppointment); // latest first
    writeJsonAppointments(appointments);
    return nextId;
  }
}

function getAppointments() {
  if (dbDriver === 'better-sqlite3') {
    const stmt = dbInstance.prepare(`
      SELECT id, patient_name, phone, department, doctor, appointment_date, appointment_time, status
      FROM appointments
      ORDER BY id DESC
    `);
    return stmt.all();
  } else {
    const appointments = readJsonAppointments();
    return appointments.sort((a, b) => b.id - a.id);
  }
}

function appointmentExists(doctor, appointment_date, appointment_time) {
  if (dbDriver === 'better-sqlite3') {
    const stmt = dbInstance.prepare(`
      SELECT id FROM appointments
      WHERE doctor = ? AND appointment_date = ? AND appointment_time = ? AND status = 'Confirmed'
    `);
    const row = stmt.get(doctor, String(appointment_date), String(appointment_time));
    return !!row;
  } else {
    const appointments = readJsonAppointments();
    return appointments.some(a =>
      a.doctor === doctor &&
      a.appointment_date === String(appointment_date) &&
      a.appointment_time === String(appointment_time) &&
      a.status === 'Confirmed'
    );
  }
}

function getBookedTimes(doctor, appointment_date) {
  if (dbDriver === 'better-sqlite3') {
    const stmt = dbInstance.prepare(`
      SELECT appointment_time FROM appointments
      WHERE doctor = ? AND appointment_date = ? AND status = 'Confirmed'
    `);
    const rows = stmt.all(doctor, String(appointment_date));
    return rows.map(r => r.appointment_time);
  } else {
    const appointments = readJsonAppointments();
    return appointments
      .filter(a =>
        a.doctor === doctor &&
        a.appointment_date === String(appointment_date) &&
        a.status === 'Confirmed'
      )
      .map(a => a.appointment_time);
  }
}

function cancelAppointment(appointment_id) {
  if (dbDriver === 'better-sqlite3') {
    const stmt = dbInstance.prepare(`
      UPDATE appointments
      SET status = 'Cancelled'
      WHERE id = ?
    `);
    stmt.run(Number(appointment_id));
  } else {
    const appointments = readJsonAppointments();
    const updated = appointments.map(a => {
      if (a.id === Number(appointment_id)) {
        return { ...a, status: 'Cancelled' };
      }
      return a;
    });
    writeJsonAppointments(updated);
  }
  return true;
}

initDatabase();

module.exports = {
  addAppointment,
  getAppointments,
  appointmentExists,
  getBookedTimes,
  cancelAppointment
};

