import React from 'react';
import {
  Home,
  Bot,
  Users,
  CalendarPlus,
  ClipboardList,
  Lock,
  BookOpen,
  PhoneCall
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, adminLoggedIn }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'faq', label: 'Hospital FAQ', icon: Bot },
    { id: 'doctors', label: 'Doctors & Departments', icon: Users },
    { id: 'booking', label: 'Appointment Booking', icon: CalendarPlus },
    { id: 'my-appointments', label: 'My Appointments', icon: ClipboardList },
    { id: 'admin', label: adminLoggedIn ? 'Admin Dashboard' : 'Admin Login', icon: Lock },
    { id: 'sources', label: 'Sources', icon: BookOpen }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">🏥</div>
        <div className="brand-text">
          <h1>CarePlus</h1>
          <p>Multispeciality Hospital</p>
        </div>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <li key={item.id} className={`nav-item ${isActive ? 'active' : ''}`}>
              <button onClick={() => onNavigate(item.id)}>
                <span className="nav-icon">
                  <Icon size={19} />
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div className="emergency-pill">
          <PhoneCall size={14} />
          <span>24/7 Emergency: 108 / Madanapalle</span>
        </div>
      </div>
    </aside>
  );
}

