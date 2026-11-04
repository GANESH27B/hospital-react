import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './components/Home';
import FaqChat from './components/FaqChat';
import Doctors from './components/Doctors';
import Booking from './components/Booking';
import MyAppointments from './components/MyAppointments';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Sources from './components/Sources';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    return !!localStorage.getItem('careplus_admin_token');
  });

  const handleNavigate = (page, params = {}) => {
    if (params.department) {
      setSelectedDepartment(params.department);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = () => {
    localStorage.setItem('careplus_admin_token', 'true');
    setAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('careplus_admin_token');
    setAdminLoggedIn(false);
    setCurrentPage('home');
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home':
        return 'CarePlus Multispeciality Hospital';
      case 'faq':
        return 'AI Hospital FAQ Chatbot';
      case 'doctors':
        return 'Doctors & Clinical Departments';
      case 'booking':
        return 'Appointment Booking';
      case 'my-appointments':
        return 'My Scheduled Appointments';
      case 'admin':
        return adminLoggedIn ? 'CarePlus Admin Dashboard' : 'CarePlus Admin Login';
      case 'sources':
        return 'RAG Knowledge Base Sources';
      default:
        return 'CarePlus Hospital';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        adminLoggedIn={adminLoggedIn}
      />

      <div className="main-wrapper">
        <Navbar
          title={getPageTitle()}
          adminLoggedIn={adminLoggedIn}
          onLogout={handleAdminLogout}
        />

        <main className="content-body">
          {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
          {currentPage === 'faq' && <FaqChat />}
          {currentPage === 'doctors' && <Doctors onNavigate={handleNavigate} />}
          {currentPage === 'booking' && (
            <Booking
              initialDepartment={selectedDepartment}
              onNavigate={handleNavigate}
            />
          )}
          {currentPage === 'my-appointments' && (
            <MyAppointments onNavigate={handleNavigate} />
          )}
          {currentPage === 'admin' && (
            adminLoggedIn ? (
              <AdminDashboard onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
            )
          )}
          {currentPage === 'sources' && <Sources />}
        </main>
      </div>
    </div>
  );
}

