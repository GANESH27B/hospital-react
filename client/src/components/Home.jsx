import React from 'react';
import { Bot, CalendarPlus, Users, ArrowRight, AlertTriangle, ShieldCheck, Clock, Award } from 'lucide-react';

export default function Home({ onNavigate }) {
  return (
    <div className="home-container">
      {/* Hero Banner */}
      <div className="hero-card">
        <h1 className="hero-title">CarePlus Multispeciality Hospital</h1>
        <p className="hero-description">
          Welcome to CarePlus Hospital, Madanapalle. We provide comprehensive healthcare information,
          intelligent AI FAQ assistance via Retrieval-Augmented Generation (RAG), and seamless doctor appointment booking.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-secondary" onClick={() => onNavigate('booking')}>
            <CalendarPlus size={18} />
            <span>Book an Appointment</span>
          </button>
          <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => onNavigate('faq')}>
            <Bot size={18} />
            <span>Ask Hospital Assistant</span>
          </button>
        </div>
      </div>

      {/* 3 Main Action Cards */}
      <div className="grid-3">
        {/* FAQ Card */}
        <div className="feature-card">
          <div>
            <div className="feature-icon-wrapper feature-icon-faq">
              <Bot size={28} />
            </div>
            <h3 className="card-title">Hospital FAQ</h3>
            <p className="card-subtitle">
              Get immediate, verifiable answers about OPD schedules, doctor fees, and hospital guidelines powered by Gemini AI & RAG.
            </p>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => onNavigate('faq')}>
            <span>Open Hospital FAQ</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Appointments Card */}
        <div className="feature-card">
          <div>
            <div className="feature-icon-wrapper feature-icon-book">
              <CalendarPlus size={28} />
            </div>
            <h3 className="card-title">Appointments</h3>
            <p className="card-subtitle">
              Choose your department, select your preferred doctor, check live 30-minute slot availability, and book online.
            </p>
          </div>
          <button className="btn btn-success btn-block" onClick={() => onNavigate('booking')}>
            <span>Book Appointment</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Doctors Card */}
        <div className="feature-card">
          <div>
            <div className="feature-icon-wrapper feature-icon-doc">
              <Users size={28} />
            </div>
            <h3 className="card-title">Doctors & Specialists</h3>
            <p className="card-subtitle">
              Explore our team of specialist doctors across Cardiology, Dermatology, Orthopedics, Pediatrics, and Neurology.
            </p>
          </div>
          <button className="btn btn-outline btn-block" onClick={() => onNavigate('doctors')}>
            <span>View Doctors</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Services Overview */}
      <div className="card">
        <h3 className="card-title">🏥 Our Key Highlights</h3>
        <p className="card-subtitle">Why patients trust CarePlus Hospital</p>

        <div className="grid-3" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
              <Clock size={22} color="#0284c7" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>24/7 Emergency Care</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Emergency and trauma department operates round-the-clock.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
              <Award size={22} color="#0d9488" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Experienced Specialists</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Consult top practitioners with 8 to 12+ years of clinical expertise.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
              <ShieldCheck size={22} color="#2563eb" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Verified RAG Intelligence</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Ground-truth verified AI answers based strictly on official hospital guidelines.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="alert alert-warning">
        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Medical Notice:</strong> This application provides general administrative and hospital guidance only. It does not provide medical diagnosis or personalized treatment recommendations. In case of emergency, please dial 108 or visit our emergency ward directly.
        </div>
      </div>
    </div>
  );
}

