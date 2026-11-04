import React, { useState, useEffect } from 'react';
import { CalendarPlus, CheckCircle2, AlertCircle, Clock, Calendar, User, Phone, Stethoscope } from 'lucide-react';
import { api } from '../services/api';

export default function Booking({ initialDepartment, onNavigate }) {
  const [departments, setDepartments] = useState([]);
  const [doctorMapping, setDoctorMapping] = useState({});

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(initialDepartment || 'Cardiology');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');

  const [slotData, setSlotData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load department and doctor metadata
  useEffect(() => {
    api.getDoctors()
      .then(res => {
        setDepartments(res.departments);
        setDoctorMapping(res.doctorMapping);
        if (!initialDepartment && res.departments.length > 0) {
          setDepartment(res.departments[0]);
        }
      })
      .catch(err => console.error(err));
  }, [initialDepartment]);

  // Fetch slots whenever department or date changes
  useEffect(() => {
    if (!department || !appointmentDate) return;
    setLoadingSlots(true);
    setErrorMsg('');
    setSelectedSlot('');

    api.getSlots(department, appointmentDate)
      .then(res => {
        setSlotData(res);
        if (res.available && res.availableSlots && res.availableSlots.length > 0) {
          setSelectedSlot(res.availableSlots[0]);
        }
        setLoadingSlots(false);
      })
      .catch(err => {
        console.error(err);
        setSlotData(null);
        setLoadingSlots(false);
      });
  }, [department, appointmentDate]);

  const assignedDoctor = doctorMapping[department] || 'No doctor listed';

  const handleBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Please enter patient name.');
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      setErrorMsg('Appointment date cannot be in the past.');
      return;
    }

    if (!selectedSlot) {
      setErrorMsg('Please select an available appointment time slot.');
      return;
    }

    setBookingLoading(true);

    try {
      const res = await api.bookAppointment({
        patient_name: patientName.trim(),
        phone: phone.trim(),
        department,
        doctor: assignedDoctor,
        appointment_date: appointmentDate,
        appointment_time: selectedSlot
      });

      setConfirmedBooking(res.appointment);
      setBookingLoading(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to book appointment.');
      setBookingLoading(false);
    }
  };

  const todayMin = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {confirmedBooking ? (
        <div className="card" style={{ border: '2px solid #10b981', textAlign: 'center', padding: '36px 24px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: '#ecfdf5', borderRadius: '50%', marginBottom: '16px' }}>
            <CheckCircle2 size={48} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065f46', marginBottom: '8px' }}>
            Appointment Confirmed!
          </h2>
          <p style={{ color: '#475569', marginBottom: '24px' }}>
            Your appointment has been successfully scheduled at CarePlus Hospital.
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 24px'
            }}
          >
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: '#64748b' }}>Appointment ID:</span>
              <strong style={{ color: '#0284c7' }}>#{confirmedBooking.id}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Patient Name</span>
                <p style={{ fontWeight: 700 }}>{confirmedBooking.patient_name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Phone Number</span>
                <p style={{ fontWeight: 700 }}>{confirmedBooking.phone}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Department</span>
                <p style={{ fontWeight: 700 }}>{confirmedBooking.department}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned Doctor</span>
                <p style={{ fontWeight: 700 }}>{confirmedBooking.doctor}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Appointment Date</span>
                <p style={{ fontWeight: 700 }}>{confirmedBooking.appointment_date}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Appointment Time</span>
                <p style={{ fontWeight: 700 }}>{confirmedBooking.appointment_time}</p>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Status</span>
              <span className="status-pill status-confirmed">Confirmed</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setConfirmedBooking(null);
                setPatientName('');
                setPhone('');
              }}
            >
              Book Another Appointment
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate('my-appointments')}>
              View My Appointments
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="card-title">
            <CalendarPlus size={22} color="#0284c7" />
            <span>Book an Appointment</span>
          </h3>
          <p className="card-subtitle">
            Fill in your details below to schedule an outpatient consultation.
          </p>

          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleBooking}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  <User size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  Patient Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Reddy"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  Phone Number (10 digits)
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor</label>
                <div
                  style={{
                    padding: '11px 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Stethoscope size={16} color="#0284c7" />
                  <span>{assignedDoctor}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={15} style={{ display: 'inline', marginRight: '6px' }} />
                Appointment Date
              </label>
              <input
                type="date"
                className="form-input"
                min={todayMin}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            {/* Time Slot Selection & Schedule Checking */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#0284c7" />
                <span>Appointment Time Slots</span>
              </h4>

              {loadingSlots ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Checking doctor OPD schedule and available slots...</p>
              ) : !slotData || !slotData.available ? (
                <div className="alert alert-warning" style={{ marginTop: '10px' }}>
                  <AlertCircle size={18} />
                  <span>{slotData?.message || `No appointment schedule available for ${department} on this date.`}</span>
                </div>
              ) : (
                <>
                  {slotData.bookedSlots && slotData.bookedSlots.length > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginBottom: '10px' }}>
                      🔴 Already booked: {slotData.bookedSlots.join(', ')}
                    </div>
                  )}

                  {slotData.availableSlots.length === 0 ? (
                    <div className="alert alert-danger">
                      <AlertCircle size={18} />
                      <span>❌ All appointment slots are booked for this date. Please choose another date.</span>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                        Select a 30-minute slot ({slotData.dayName} OPD):
                      </p>

                      <div className="slot-grid">
                        {slotData.allSlots.map((slot) => {
                          const isBooked = slotData.bookedSlots.includes(slot);
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              className={`slot-chip ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ marginTop: '32px' }}>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={bookingLoading || loadingSlots || !slotData?.available || slotData?.availableSlots?.length === 0 || !selectedSlot}
              >
                {bookingLoading ? 'Processing Booking...' : '📅 Confirm & Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

